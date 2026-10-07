import { useEffect, useState } from 'react';
import { AudioManifest } from '../model/AudioManifest.ts';

const manifestRequests = new Map<string, Promise<AudioManifest | null>>();

/**
 * Loads the pronunciation manifest for a language and deck group, or null
 * when that group has no generated audio yet (404) or the request fails. One
 * request per language and group per page load; the server marks manifests
 * no-cache so a reload picks up newly generated audio.
 */
export function loadAudioManifest(lang: string, group: string): Promise<AudioManifest | null> {
  const key = `${lang}/${group}`;
  let request = manifestRequests.get(key);
  if (!request) {
    request = fetchManifest(lang, group);
    manifestRequests.set(key, request);
  }
  return request;
}

async function fetchManifest(lang: string, group: string): Promise<AudioManifest | null> {
  try {
    const resp = await fetch(`/api/audio/${encodeURIComponent(lang)}/${encodeURIComponent(group)}/manifest.json`);
    if (!resp.ok) {
      return null;
    }
    return (await resp.json()) as AudioManifest;
  } catch (e) {
    console.warn(`Audio manifest for "${lang}/${group}" unavailable`, e);
    return null;
  }
}

/** React hook: the manifest for `lang` and `group`, null until loaded or when unavailable. */
export function useAudioManifest(lang: string, group: string): AudioManifest | null {
  const [manifest, setManifest] = useState<AudioManifest | null>(null);

  useEffect(() => {
    let cancelled = false;
    setManifest(null);
    loadAudioManifest(lang, group).then((m) => {
      if (!cancelled) setManifest(m);
    });
    return () => {
      cancelled = true;
    };
  }, [lang, group]);

  return manifest;
}
