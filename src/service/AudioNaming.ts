/**
 * Shared rules for turning a deck entry into the text(s) that get voiced
 * and the file name each recording is stored under.
 *
 * Used by both the app (to build audio URLs) and scripts/generate-audio.ts
 * (to decide what to send to TTS and where to write the result), so the two
 * can never disagree about a file name.
 */

// "[informal]": a note for the reader, never spoken.
const IN_BRACKETS = /\[.+?\]/g;
// "(el/la)": either article, so the word is voiced without one.
const EITHER_IN_PARENTHESES = /\([^)]*\/[^)]*\)/g;
const PARENTHESES = /[()]/g;
const WHITESPACE = /\s+/g;
// Illegal in file names on at least one OS, awkward inside a URL path segment,
// or a control character (Unicode category Cc).
const UNSAFE_IN_FILE_NAME = /[\\/:*?"<>|#%&\p{Cc}]/gu;
// Sentence punctuation adds nothing to a name, and a trailing "." would double up with ".mp3".
const SENTENCE_PUNCTUATION = /[.,!?¿¡…]/g;

/**
 * Splits a deck `word` into the texts to voice, one per alternative.
 * The conventions (see public/wordfiles/README.md):
 *   "|" separates alternatives:  "(la) cara | (el) rostro" -> ["la cara", "el rostro"]
 *   "( )" is spoken, shown as optional:  "(le) pain" -> ["le pain"]
 *   "( / )" means either, voiced bare:  "(el/la) artista" -> ["artista"]
 *   "[ ]" is a silent note:  "mennä poikki [e.g. a room]" -> ["mennä poikki"]
 * A comma is ordinary punctuation: "Oui, je veux ça." -> ["Oui, je veux ça."].
 */
export function deriveVoicedTexts(word: string): string[] {
  return word
    .replace(IN_BRACKETS, '')
    .replace(EITHER_IN_PARENTHESES, '')
    .split('|')
    .map((part) => part.replace(PARENTHESES, '').replace(WHITESPACE, ' ').trim())
    .filter((part) => part.length > 0);
}

/**
 * File name for one voiced text, without directory: "el pecho" -> "el_pecho.mp3",
 * "¿Quieres esto?" -> "Quieres_esto.mp3". Non-Latin letters and accents are kept;
 * only whitespace, unsafe characters and sentence punctuation change.
 */
export function audioFileName(text: string): string {
  const name = text
    .normalize('NFC')
    .replace(UNSAFE_IN_FILE_NAME, '')
    .replace(SENTENCE_PUNCTUATION, '')
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
