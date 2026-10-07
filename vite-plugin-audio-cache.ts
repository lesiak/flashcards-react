/**
 * Vite dev-server plugin serving pre-generated pronunciation audio from the
 * local audio-cache/ directory at /api/audio/*, so the app can use its final
 * URL scheme in `npm run dev` without any Azure resources.
 *
 *   /api/audio/es/words/manifest.json                    -> audio-cache/es/words/manifest.json
 *   /api/audio/es/words/cgSgspJ2msm6clMCkdW9/el_pecho.mp3 -> audio-cache/es/words/cgSgspJ2msm6clMCkdW9/el_pecho.mp3
 *
 * In production the same route is an Azure Function reading from Blob Storage.
 * Files are produced by `npm run audio` (scripts/generate-audio.ts).
 */

import { createReadStream, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, resolve, sep } from 'node:path';
import type { Plugin } from 'vite';

const ROUTE = '/api/audio';

// mp3 names embed the voice id, so their content never changes: cache forever.
// Manifests are rewritten by the script, so always revalidate them.
const CONTENT: Record<string, { type: string; cacheControl: string }> = {
  '.mp3': { type: 'audio/mpeg', cacheControl: 'public, max-age=31536000, immutable' },
  '.json': { type: 'application/json; charset=utf-8', cacheControl: 'no-cache' },
};

export function audioCachePlugin(audioDir = 'audio-cache'): Plugin {
  const root = resolve(audioDir);

  return {
    name: 'flashcards:audio-cache',
    configureServer(server) {
      server.config.logger.info(`  ➜  audio:   serving ${ROUTE}/* from ${root}`);
      server.middlewares.use(ROUTE, (req, res, next) => serve(root, req, res, next));
    },
  };
}

function serve(root: string, req: IncomingMessage, res: ServerResponse, next: () => void): void {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const filePath = resolveSafePath(root, req.url ?? '/');
  if (filePath === null) {
    return reply(res, 400, 'Bad audio path');
  }

  const content = CONTENT[extensionOf(filePath)];
  if (!content) {
    return reply(res, 404, 'Not found');
  }

  let size: number;
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) return reply(res, 404, 'Not found');
    size = stat.size;
  } catch {
    return reply(res, 404, 'Not found');
  }

  res.setHeader('Content-Type', content.type);
  res.setHeader('Cache-Control', content.cacheControl);
  res.setHeader('Accept-Ranges', 'bytes');

  // Safari asks for media with Range requests and refuses to play without 206 support.
  const range = parseRange(req.headers.range, size);
  if (range === 'unsatisfiable') {
    res.setHeader('Content-Range', `bytes */${size}`);
    return reply(res, 416, 'Range not satisfiable');
  }

  const [start, end] = range ?? [0, size - 1];
  if (range) {
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  } else {
    res.statusCode = 200;
  }
  res.setHeader('Content-Length', end - start + 1);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath, { start, end }).pipe(res);
}

/**
 * Turns the percent-encoded URL path into an absolute file path under `root`,
 * or null if it is malformed or would escape the directory.
 */
function resolveSafePath(root: string, url: string): string | null {
  const pathOnly = url.split('?')[0];
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    return null;
  }

  const segments = decoded.split('/').filter((s) => s.length > 0);
  if (segments.length === 0 || segments.some((s) => s === '.' || s === '..' || s.includes('\\'))) {
    return null;
  }

  const filePath = join(root, ...segments);
  return filePath.startsWith(root + sep) ? filePath : null;
}

function extensionOf(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  return dot === -1 ? '' : filePath.slice(dot).toLowerCase();
}

/** Supports a single `bytes=start-end` range, which is all browsers send for media. */
function parseRange(header: string | undefined, size: number): [number, number] | 'unsatisfiable' | null {
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

function reply(res: ServerResponse, status: number, message: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}
