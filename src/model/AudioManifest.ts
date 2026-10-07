/**
 * Shape of audio-cache/{lang}/{group}/manifest.json, written by
 * scripts/generate-audio.ts and read by the app from
 * /api/audio/{lang}/{group}/manifest.json. One manifest per deck group, so
 * the same word in two groups is voiced and stored once per group.
 */

export interface VoiceConfig {
  voiceId: string;
  modelId: string;
  outputFormat: string;
}

export interface AudioManifestEntry {
  /** Exactly what was sent to text-to-speech, e.g. "el pecho". */
  text: string;
  /** Path relative to the audio root, e.g. "es/words/cgSgspJ2msm6clMCkdW9/el_pecho.mp3". */
  file: string;
}

export interface AudioManifest {
  version: 2;
  lang: string;
  /** Deck group folder, e.g. "words" or "a1". */
  group: string;
  /** Voice settings in force when the manifest was last written. */
  voice: VoiceConfig;
  /** Keyed by the raw deck `word`; one entry per voiced synonym. */
  entries: Record<string, AudioManifestEntry[]>;
}
