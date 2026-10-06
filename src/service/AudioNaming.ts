/**
 * Shared rules for turning a deck entry into the text(s) that get voiced
 * and the file name each recording is stored under.
 *
 * Used by both the app (to build audio URLs) and scripts/generate-audio.ts
 * (to decide what to send to TTS and where to write the result), so the two
 * can never disagree about a file name.
 */

const IN_BRACKETS = /\[.+?\]/g;
const PARENTHESES = /[()]/g;
const WHITESPACE = /\s+/g;
// A whole sentence such as "Oui, je veux ça."; its commas are punctuation, not synonym separators.
const SENTENCE_END = /[.!?]\s*$/;
// Illegal in file names on at least one OS, awkward inside a URL path segment,
// or a control character (Unicode category Cc).
const UNSAFE_IN_FILE_NAME = /[\\/:*?"<>|#%&\p{Cc}]/gu;

/**
 * Splits a deck `word` into the texts to voice, one per synonym,
 * with articles kept: "(la) cara, (el) rostro" -> ["la cara", "el rostro"].
 * Whole sentences separate their alternatives with "|" so their own commas
 * survive: "Tu veux ça ? | Veux-tu ça ?" -> ["Tu veux ça ?", "Veux-tu ça ?"].
 * Bracketed comments such as "[informal]" are dropped.
 */
export function deriveVoicedTexts(word: string): string[] {
  const withoutComments = word.replace(IN_BRACKETS, '');
  const parts = withoutComments.includes('|') || SENTENCE_END.test(withoutComments)
    ? withoutComments.split('|')
    : withoutComments.split(',');
  return parts
    .map((part) => part.replace(PARENTHESES, '').replace(WHITESPACE, ' ').trim())
    .filter((part) => part.length > 0);
}

/**
 * File name for one voiced text, without directory: "el pecho" -> "el_pecho.mp3".
 * Non-Latin letters and accents are kept; only whitespace and unsafe punctuation change.
 */
export function audioFileName(text: string): string {
  const name = text
    .normalize('NFC')
    .replace(UNSAFE_IN_FILE_NAME, '')
    .trim()
    .replace(WHITESPACE, '_');
  if (name.length === 0) {
    throw new Error(`Text "${text}" produces an empty file name`);
  }
  return `${name}.mp3`;
}

/**
 * Path relative to the audio root, shared by the local cache dir,
 * the blob container and the /api/audio URL: "es/cgSgspJ2msm6clMCkdW9/el_pecho.mp3".
 * The middle segment is the TTS voice id, so a new voice never overwrites an old one.
 */
export function audioFilePath(lang: string, voiceId: string, text: string): string {
  return `${lang}/${voiceId}/${audioFileName(text)}`;
}

/** URL the app fetches; each path segment is encoded so non-ASCII names survive. */
export function audioUrl(filePath: string): string {
  return '/api/audio/' + filePath.split('/').map(encodeURIComponent).join('/');
}
