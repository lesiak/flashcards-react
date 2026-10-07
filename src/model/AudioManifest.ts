/**
 * Shape of audio-cache/{lang}/{group}/manifest.json, written by
 * scripts/generate-audio.ts and read by the app from
 * /api/audio/{lang}/{group}/manifest.json. One manifest per deck group.
 *
 * Clips are keyed by the voiced text, exactly what was sent to
 * text-to-speech ("el pecho", "¿Quieres esto?"). The app derives those
 * texts from a card's `word` with deriveVoicedTexts(), so rewording a card's
 * marks or separators never orphans a recording, and two cards that share
 * an alternative share one clip.
 */

export interface VoiceConfig {
  voiceId: string;
  modelId: string;
  outputFormat: string;
}

export interface AudioManifest {
  version: 3;
  lang: string;
  /** Deck group folder, e.g. "words" or "a1". */
  group: string;
  /** Voice settings in force when the manifest was last written. */
  voice: VoiceConfig;
  /** Voiced text -> path relative to the audio root, e.g. "es/words/cgSgspJ2msm6clMCkdW9/el_pecho.mp3". */
  clips: Record<string, string>;
}

/** One playable clip of a card: the text spoken and where its file lives. */
export interface AudioManifestEntry {
  text: string;
  file: string;
}
