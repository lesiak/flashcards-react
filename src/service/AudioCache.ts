/**
 * Cache-first access to pronunciation audio using the browser Cache API.
 *
 * Audio URLs embed the voice id, so a file's content never changes and an
 * entry never needs invalidating. Each file is therefore fetched from the
 * server at most once per browser; later plays come from the cache. This
 * also lays the groundwork for offline use, where a service worker would
 * serve the same cache.
 */

const CACHE_NAME = 'pronunciation-audio-v1';

/** Returns the audio at `url` as a Blob, from the cache when present. */
export async function fetchAudioBlob(url: string): Promise<Blob> {
  const cache = await openCache();

  if (cache) {
    const hit = await cache.match(url);
    if (hit) {
      return hit.blob();
    }
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Audio request failed with ${resp.status}: ${url}`);
  }
  if (cache) {
    // put() consumes the body, so store a clone and return the original.
    await cache.put(url, resp.clone()).catch((e) => console.warn('Audio cache write failed', e));
  }
  return resp.blob();
}

/** Plays the audio at `url` once, resolving when playback has started. */
export async function playCachedAudio(url: string): Promise<void> {
  const blob = await fetchAudioBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);
  const release = () => URL.revokeObjectURL(objectUrl);
  audio.addEventListener('ended', release, { once: true });
  audio.addEventListener('error', release, { once: true });

  try {
    await audio.play();
  } catch (e) {
    release();
    throw e;
  }
}

/** The Cache API is absent in insecure contexts and some private modes; degrade to plain fetch. */
async function openCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') {
    return null;
  }
  try {
    return await caches.open(CACHE_NAME);
  } catch (e) {
    console.warn('Audio cache unavailable', e);
    return null;
  }
}
