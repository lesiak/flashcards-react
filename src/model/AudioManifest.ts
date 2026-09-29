/**
 * Shape of audio-cache/{lang}/manifest.json, written by scripts/generate-audio.ts
 * and read by the app from /api/audio/{lang}/manifest.json.
 */

export interface VoiceConfig {
  voiceId: string;
  modelId: string;
  outputFormat: string;
}

export interface AudioManifestEntry {
  /** Exactly what was sent to text-to-speech, e.g. "el pecho". */
  text: string;
  /** Path relative to the audio root, e.g. "es/cgSgspJ2msm6clMCkdW9/el_pecho.mp3". */
  file: string;
}

export interface AudioManifest {
  version: 1;
  lang: string;
  /** Voice settings in force when the manifest was last written. */
  voice: VoiceConfig;
  /** Keyed by the raw deck `word`; one entry per voiced synonym. */
  entries: Record<string, AudioManifestEntry[]>;
}
