

const IN_PARENTHESES = new RegExp("\\(.+?\\)");

const IN_BRACKETS = new RegExp("\\[.+?\\]");

export function sanitizeWordEntry(lang: string, word: string) {
  word = _removeCommentsInParentheses(word);
  if (word.includes(',')) {
    word = word.split(',')[0];
  } else if (word.includes(';')) {
    word = word.split(';')[0];
  }
  return _sanitizeSingleWord(lang, word);
}

export function getAllSanitizedWords(lang: string, word: string): string[] {
  word = _removeCommentsInParentheses(word);
  let words: string[];
  if (word.includes(',')) {
    words = word.split(',');
  } else if (word.includes(';')) {
    words = word.split(';');
  } else {
    words = [word];
  }
  return words.map((word) => _sanitizeSingleWord(lang, word));
}

function _removeCommentsInParentheses(word: string) {
  if (word.match(IN_PARENTHESES)) {
    word = word.replaceAll(IN_PARENTHESES, "");
  }
  if (word.match(IN_BRACKETS)) {
    word = word.replaceAll(IN_BRACKETS, "");
  }
  return word;
}

function _sanitizeSingleWord(lang: string, word: string) {
  if (lang == "en") {
    if (word.startsWith("to ")) {
      word = word.substring(3);
    } else if (word.startsWith("a ")) {
      word = word.substring(2);
    } else if (word.startsWith("an ")) {
      word = word.substring(3);
    }
  } else if (lang == "de") {
    if (word.startsWith("der ") || word.startsWith("das ") || word.startsWith("die ")) {
      word = word.substring(4);
    }
  }
  return word.trim();
}
