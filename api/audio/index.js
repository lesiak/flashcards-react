/**
 * GET /api/audio/{lang}/{voiceId}/{name}.mp3
 * GET /api/audio/{lang}/manifest.json
 *
 * Serves pre-generated pronunciation audio from the private "pronunciations"
 * blob container. The container is reached with a read-only SAS URL held in
 * the AUDIO_CONTAINER_SAS_URL application setting; nothing about storage is
 * visible to the browser, which only ever sees /api/audio/... on our domain.
 *
 * Login is enforced before this runs by the /api/* route rule in
 * staticwebapp.config.json. In `npm run dev` the same URLs are served from
 * the local audio-cache/ directory by vite-plugin-audio-cache.ts, and the
 * headers below deliberately match it.
 */

const { ContainerClient } = require('@azure/storage-blob');

// mp3 names embed the voice id, so their content never changes: cache forever.
// Manifests are rewritten by the generation script, so always revalidate them.
const CONTENT = {
  '.mp3': { type: 'audio/mpeg', cacheControl: 'public, max-age=31536000, immutable' },
  '.json': { type: 'application/json; charset=utf-8', cacheControl: 'no-cache' },
};

let defaultClient;

function getDefaultClient() {
  if (!defaultClient) {
    const sasUrl = process.env.AUDIO_CONTAINER_SAS_URL;
    if (!sasUrl) {
      throw new Error('AUDIO_CONTAINER_SAS_URL is not set');
    }
    defaultClient = new ContainerClient(sasUrl);
  }
  return defaultClient;
}

/**
 * Builds the handler around a container client factory, so tests can pass a
 * fake client while production uses the SAS URL from the environment.
 */
function createHandler(getClient) {
  return async function audio(context, req) {
    const blobName = resolveBlobName(context.bindingData.path);
    if (blobName === null) {
      return respond(context, 400, 'Bad audio path');
    }

    const content = CONTENT[extensionOf(blobName)];
    if (!content) {
      return respond(context, 404, 'Not found');
    }

    let client;
    try {
      client = getClient();
    } catch (e) {
      context.log.error(e.message);
      return respond(context, 500, 'Audio storage is not configured');
    }

    const blob = client.getBlobClient(blobName);
    let properties;
    try {
      properties = await blob.getProperties();
    } catch (e) {
      if (e.statusCode === 404) {
        return respond(context, 404, 'Not found');
      }
      context.log.error(`Blob lookup failed for ${blobName}: ${e.message}`);
      return respond(context, 502, 'Audio storage error');
    }

    const size = properties.contentLength ?? 0;
    const headers = {
      'Content-Type': content.type,
      'Cache-Control': content.cacheControl,
      'Accept-Ranges': 'bytes',
    };
    if (properties.etag) {
      headers['ETag'] = properties.etag;
      // Revalidation: the browser sends the ETag it holds; if unchanged, skip the body.
      if (etagMatches(req.headers && req.headers['if-none-match'], properties.etag)) {
        context.res = { status: 304, headers };
        return;
      }
    }

    // Safari asks for media with Range requests and refuses to play without 206 support.
    const range = parseRange(req.headers && req.headers.range, size);
    if (range === 'unsatisfiable') {
      headers['Content-Range'] = `bytes */${size}`;
      return respond(context, 416, 'Range not satisfiable', headers);
    }

    const [start, end] = range || [0, size - 1];
    const length = size === 0 ? 0 : end - start + 1;
    const body = length === 0 ? Buffer.alloc(0) : await blob.downloadToBuffer(start, length);

    headers['Content-Length'] = String(body.length);
    if (range) {
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
    context.res = { status: range ? 206 : 200, headers, body, isRaw: true };
  };
}

/**
 * Turns the wildcard route value into a blob name, or null if it is
 * malformed or tries to step outside the container.
 */
function resolveBlobName(rawPath) {
  if (typeof rawPath !== 'string' || rawPath.length === 0) {
    return null;
  }
  let decoded = rawPath;
  if (rawPath.includes('%')) {
    try {
      decoded = decodeURIComponent(rawPath);
    } catch {
      return null;
    }
  }
  const segments = decoded.split('/').filter((s) => s.length > 0);
  if (segments.length === 0 || segments.some((s) => s === '.' || s === '..' || s.includes('\\'))) {
    return null;
  }
  return segments.join('/');
}

/**
 * True if the If-None-Match header names the current ETag. The header may list
 * several tags, use a W/ weak prefix, or be "*"; the platform may also strip
 * the quotes, so compare the bare values.
 */
function etagMatches(header, etag) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  const bare = (tag) => tag.trim().replace(/^W\//, '').replace(/^"|"$/g, '');
  const current = bare(etag);
  return header.split(',').some((tag) => bare(tag) === current);
}

function extensionOf(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/** Supports a single `bytes=start-end` range, which is all browsers send for media. */
function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (match[1] === '' && match[2] === '')) return null;

  let start = match[1] === '' ? NaN : Number(match[1]);
  let end = match[2] === '' ? size - 1 : Number(match[2]);
  if (Number.isNaN(start)) {
    // Suffix range: last N bytes.
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  }
  if (start >= size || start > end) return 'unsatisfiable';
  return [start, Math.min(end, size - 1)];
}

function respond(context, status, message, headers = {}) {
  context.res = {
    status,
    headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
    body: message,
  };
}

module.exports = createHandler(getDefaultClient);
module.exports.createHandler = createHandler;
