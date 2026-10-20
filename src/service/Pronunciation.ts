import {AudioManifestEntry} from '../model/AudioManifest.ts';
import {playCachedAudio} from './AudioCache.ts';
import {audioUrl, deriveVoicedTexts} from './AudioNaming.ts';

/** One clip per voiced alternative of `word` that has a recording in `clips`, in deck order. */
export function findPronunciations(clips: Record<string, string>, word: string): AudioManifestEntry[] {
  return deriveVoicedTexts(word)
    .map((text) => ({text, file: clips[text]}))
    .filter((entry): entry is AudioManifestEntry => entry.file !== undefined);
}

export function playPronunciation(entry: AudioManifestEntry): void {
  playCachedAudio(audioUrl(entry.file)).catch((e) => console.warn(`Cannot play "${entry.text}"`, e));
}
