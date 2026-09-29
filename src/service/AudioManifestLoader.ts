import { useEffect, useState } from 'react';
import { AudioManifest } from '../model/AudioManifest.ts';

const manifestRequests = new Map<string, Promise<AudioManifest | null>>();

/**
 * Loads the pronunciation manifest for a language, or null when the language
 * has no generated audio yet (404) or the request fails. One request per
 * language per page load; the server marks manifests no-cache so a reload
 * picks up newly generated audio.
 */
export function loadAudioManifest(lang: string): Promise<AudioManifest | null> {
  let request = manifestRequests.get(lang);
  if (!request) {
    request = fetchManifest(lang);
    manifestRequests.set(lang, request);
  }
  return request;
}

async function fetchManifest(lang: string): Promise<AudioManifest | null> {
  try {
    const resp = await fetch(`/api/audio/${encodeURIComponent(lang)}/manifest.json`);
    if (!resp.ok) {
      return null;
    }
    return (await resp.json()) as AudioManifest;
  } catch (e) {
    console.warn(`Audio manifest for "${lang}" unavailable`, e);
    return null;
  }
}

/** React hook: the manifest for `lang`, null until loaded or when unavailable. */
export function useAudioManifest(lang: string): AudioManifest | null {
  const [manifest, setManifest] = useState<AudioManifest | null>(null);

  useEffect(() => {
    let cancelled = false;
    setManifest(null);
    loadAudioManifest(lang).then((m) => {
      if (!cancelled) setManifest(m);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return manifest;
}
