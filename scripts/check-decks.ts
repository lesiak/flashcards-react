/**
 * Validates the deck files under public/wordfiles against the conventions in
 * public/wordfiles/README.md, so a broken deck is caught early instead of
 * showing up as a skipped deck or a silent audio miss in the app. Run it by
 * hand before committing deck changes; it is not part of the build.
 *
 * Checked:
 *   - Lessons.json: every course has an id, a name and sections, each with a
 *     name and deck names, no duplicates within a course; every listed deck
 *     exists for at least one language.
 *   - A course's optional "languages" is a non-empty list of language codes,
 *     and only those languages have a folder of decks for it.
 *   - Every deck file sits in a listed course folder and is itself listed, except
 *     "toDrop", which is kept on disk only while its cards are sorted out.
 *   - A deck has a name, a description, an optional image URL and at least
 *     one card; a card has "en" and "word" and optionally "romanization" and
 *     "note", nothing else.
 *   - "en" is unique within a deck, has no surrounding whitespace and is not
 *     empty. "word" has no surrounding or doubled whitespace, balanced and
 *     unnested brackets, and no empty alternative around "|".
 *   - "romanization" has one non-empty part per "|" alternative of "word" and
 *     no brackets, which belong in "word".
 *   - Two alternatives in one language group never collapse to the same clip
 *     file name, since the audio script refuses such a group.
 *   - A words deck has at most MAX_CARDS cards (the course decks are imported
 *     whole, so they get their own limit).
 *   - An existing manifest is a version 3 manifest.
 *
 * An empty "word" is a card not yet translated: reported as a warning, never
 * a failure, so a language can grow deck by deck.
 *
 * Usage: npm run decks:check
 * Exits 1 when there is at least one error.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioFileName, deriveVoicedTexts } from '../src/service/AudioNaming.ts';
import type { Lesson } from '../src/model/Lesson.ts';
import { courseIsFor, type DeckIndex } from '../src/service/DeckLoader.ts';

// ---------------------------------------------------------------- settings

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORDFILES = join(REPO_ROOT, 'public', 'wordfiles');
const AUDIO_ROOT = join(REPO_ROOT, 'audio-cache');
const INDEX_FILE = 'Lessons.json';

/** Deck files allowed on disk without an entry in Lessons.json. */
const UNLISTED_DECKS = new Set(['toDrop']);

/** Largest deck per group; a group not named here uses "default". */
const MAX_CARDS: Record<string, number> = { default: 100, a1: 200 };

const CARD_KEYS = new Set(['en', 'word', 'romanization', 'note']);

// ---------------------------------------------------------------- reporting

let errors = 0;
let warnings = 0;

function error(where: string, message: string): void {
  errors++;
  console.log(`ERROR    ${where}: ${message}`);
}

function warn(where: string, message: string): void {
  warnings++;
  console.log(`WARNING  ${where}: ${message}`);
}

// ---------------------------------------------------------------- helpers

function readJson(path: string, where: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    error(where, `not valid JSON: ${(e as Error).message}`);
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function subdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory()).sort();
}

function deckFiles(dir: string): string[] {
  return readdirSync(dir).filter((name) => name.endsWith('.json')).sort();
}

/** Brackets must balance, pair up and never nest: "(la) casa [home]" is fine, "((la)" or "[(x)]" is not. */
function bracketProblem(word: string): string | undefined {
  let open: string | undefined;
  for (const ch of word) {
    if (ch === '(' || ch === '[') {
      if (open) return `nested bracket at "${ch}"`;
      open = ch;
    } else if (ch === ')' || ch === ']') {
      const expected = ch === ')' ? '(' : '[';
      if (open !== expected) return `unexpected "${ch}"`;
      open = undefined;
    }
  }
  return open ? `unclosed "${open}"` : undefined;
}

// ---------------------------------------------------------------- index

function loadIndex(): DeckIndex | undefined {
  const where = INDEX_FILE;
  const raw = readJson(join(WORDFILES, INDEX_FILE), where);
  if (raw === undefined) return undefined;
  if (!isRecord(raw) || !Array.isArray(raw.courses)) {
    error(where, 'expected an object with a "courses" array');
    return undefined;
  }
  const courseIds = new Set<string>();
  for (const [i, course] of raw.courses.entries()) {
    if (!isRecord(course) || typeof course.id !== 'string' || typeof course.name !== 'string' || !Array.isArray(course.sections)) {
      error(where, `courses[${i}] needs string "id" and "name" and a "sections" array`);
      return undefined;
    }
    if (courseIds.has(course.id)) error(where, `course "${course.id}" is listed twice`);
    courseIds.add(course.id);
    if (course.sections.length === 0) error(where, `course "${course.id}" has no sections`);
    if (course.languages !== undefined && (!Array.isArray(course.languages) || course.languages.length === 0
        || course.languages.some((lang) => typeof lang !== 'string' || lang.length === 0))) {
      error(where, `course "${course.id}" "languages" must be a non-empty array of language codes`);
      return undefined;
    }
    const sectionNames = new Set<string>();
    const deckNames = new Set<string>();
    for (const [j, section] of course.sections.entries()) {
      if (!isRecord(section) || typeof section.name !== 'string' || section.name.length === 0 || !Array.isArray(section.decks)) {
        error(where, `course "${course.id}" sections[${j}] needs a non-empty string "name" and a "decks" array`);
        return undefined;
      }
      if (sectionNames.has(section.name)) error(where, `course "${course.id}" has two sections named "${section.name}"`);
      sectionNames.add(section.name);
      if (section.decks.length === 0) error(where, `course "${course.id}" section "${section.name}" has no decks`);
      for (const deck of section.decks) {
        if (typeof deck !== 'string' || deck.length === 0) {
          error(where, `course "${course.id}" section "${section.name}" has a deck name that is not a non-empty string`);
        } else if (deckNames.has(deck)) {
          error(where, `course "${course.id}" lists deck "${deck}" twice`);
        } else {
          deckNames.add(deck);
        }
      }
    }
  }
  return raw as unknown as DeckIndex;
}

/** Course id -> every deck name its sections list. */
function listedDecks(index: DeckIndex): Map<string, Set<string>> {
  return new Map(index.courses.map((c) => [c.id, new Set(c.sections.flatMap((s) => s.decks))]));
}

// ---------------------------------------------------------------- decks

/** Clip file name -> voiced text it came from, per lang/group, to catch two texts that would share a file. */
type ClipNames = Map<string, string>;

/** Cards seen and cards without a word, summed over a language's course so untranslated decks give one warning, not hundreds. */
interface CardStats {
  cards: number;
  untranslated: number;
}

function checkRomanization(at: string, label: string, word: string, romanization: unknown): void {
  if (typeof romanization !== 'string' || romanization.trim().length === 0) {
    error(at, '"romanization" must be a non-empty string when present');
    return;
  }
  const parts = romanization.split('|');
  const alternatives = word.split('|').length;
  if (parts.length !== alternatives) {
    error(at, `"romanization" has ${parts.length} part(s) for ${alternatives} alternative(s) in ${label}`);
  }
  if (parts.some((part) => part.trim().length === 0)) error(at, `empty part around "|" in romanization of ${label}`);
  if (/[()[\]]/.test(romanization)) error(at, `brackets in romanization of ${label}; they belong in "word"`);
  if (romanization !== romanization.trim() || /\s{2,}/.test(romanization)) {
    error(at, `"romanization" has surrounding or doubled whitespace in ${label}`);
  }
}

function checkDeck(path: string, where: string, group: string, clipNames: ClipNames, stats: CardStats): void {
  const raw = readJson(path, where);
  if (raw === undefined) return;
  if (!isRecord(raw)) {
    error(where, 'expected an object');
    return;
  }
  const deck = raw as Partial<Lesson> & Record<string, unknown>;
  if (typeof deck.name !== 'string' || deck.name.trim().length === 0) error(where, '"name" must be a non-empty string');
  if (typeof deck.description !== 'string') error(where, '"description" must be a string');
  if (deck.image !== undefined && (typeof deck.image !== 'string' || (deck.image.length > 0 && !/^https?:\/\//.test(deck.image)))) {
    error(where, '"image" must be an http(s) URL or empty');
  }
  if (!Array.isArray(deck.cards)) {
    error(where, '"cards" must be an array');
    return;
  }
  if (deck.cards.length === 0) error(where, 'has no cards');
  const limit = MAX_CARDS[group] ?? MAX_CARDS.default;
  if (deck.cards.length > limit) error(where, `has ${deck.cards.length} cards; the limit for group "${group}" is ${limit}`);

  const seenEn = new Set<string>();
  let untranslated = 0;
  deck.cards.forEach((card: unknown, i: number) => {
    const at = `${where} card ${i + 1}`;
    if (!isRecord(card)) {
      error(at, 'is not an object');
      return;
    }
    for (const key of Object.keys(card)) {
      if (!CARD_KEYS.has(key)) error(at, `unknown field "${key}"`);
    }
    const { en, word, romanization, note } = card;
    if (typeof en !== 'string' || en.trim().length === 0) {
      error(at, '"en" must be a non-empty string');
    } else {
      if (en !== en.trim()) error(at, `"en" has surrounding whitespace: "${en}"`);
      const key = en.trim();
      if (seenEn.has(key)) error(at, `"en" repeated within the deck: "${key}"`);
      seenEn.add(key);
    }
    if (note !== undefined && (typeof note !== 'string' || note.trim().length === 0)) {
      error(at, '"note" must be a non-empty string when present');
    }
    if (typeof word !== 'string') {
      error(at, '"word" must be a string');
      return;
    }
    if (word.length === 0) {
      untranslated++;
      return;
    }
    const label = `"${en}" = "${word}"`;
    if (word !== word.trim()) error(at, `"word" has surrounding whitespace: ${label}`);
    if (/\s{2,}/.test(word)) error(at, `"word" has doubled whitespace: ${label}`);
    const problem = bracketProblem(word);
    if (problem) error(at, `${problem} in ${label}`);
    if (word.split('|').some((alt) => alt.trim().length === 0)) error(at, `empty alternative around "|" in ${label}`);
    if (romanization !== undefined) checkRomanization(at, label, word, romanization);
    if (problem) return;
    for (const text of deriveVoicedTexts(word)) {
      let file: string;
      try {
        file = audioFileName(text);
      } catch (e) {
        error(at, `${(e as Error).message} in ${label}`);
        continue;
      }
      const other = clipNames.get(file);
      if (other !== undefined && other !== text) {
        error(at, `"${text}" and "${other}" would share the clip ${file}`);
      }
      clipNames.set(file, text);
    }
  });
  stats.cards += deck.cards.length;
  stats.untranslated += untranslated;
}

// ---------------------------------------------------------------- manifests

function checkManifest(lang: string, group: string): void {
  const path = join(AUDIO_ROOT, lang, group, 'manifest.json');
  if (!existsSync(path)) return;
  const where = `audio-cache/${lang}/${group}/manifest.json`;
  const raw = readJson(path, where);
  if (raw === undefined) return;
  if (!isRecord(raw) || raw.version !== 3 || raw.lang !== lang || raw.group !== group || !isRecord(raw.clips)) {
    error(where, `expected a version 3 manifest for ${lang}/${group} with a "clips" object`);
  }
}

// ---------------------------------------------------------------- main

function main(): void {
  const index = loadIndex();
  if (!index) return;
  const courses = listedDecks(index);
  const seenListed = new Set<string>();
  let files = 0;

  // A language folder holds one folder per course; the course id doubles as the audio group.
  for (const lang of subdirs(WORDFILES)) {
    for (const group of subdirs(join(WORDFILES, lang))) {
      const listed = courses.get(group);
      const dir = join(WORDFILES, lang, group);
      const names = deckFiles(dir);
      if (!listed) {
        if (names.length > 0) error(`${lang}/${group}`, `folder is not a course in ${INDEX_FILE}`);
        continue;
      }
      const course = index.courses.find((c) => c.id === group)!;
      if (names.length > 0 && !courseIsFor(course, lang)) {
        error(`${lang}/${group}`, `course "${group}" is only for ${course.languages!.join(', ')} in ${INDEX_FILE}`);
      }
      const clipNames: ClipNames = new Map();
      const stats: CardStats = {cards: 0, untranslated: 0};
      for (const name of names) {
        const deckName = name.slice(0, -'.json'.length);
        const where = `${lang}/${group}/${name}`;
        if (listed.has(deckName)) {
          seenListed.add(`${group}/${deckName}`);
        } else if (!UNLISTED_DECKS.has(deckName)) {
          error(where, `deck is not listed under course "${group}" in ${INDEX_FILE}`);
        }
        files++;
        checkDeck(join(dir, name), where, group, clipNames, stats);
      }
      if (stats.untranslated > 0) {
        warn(`${lang}/${group}`, `${stats.untranslated} of ${stats.cards} cards have no "word" yet`);
      }
      checkManifest(lang, group);
    }
  }

  for (const [courseId, decks] of courses) {
    for (const deck of decks) {
      if (!seenListed.has(`${courseId}/${deck}`)) error(INDEX_FILE, `deck "${courseId}/${deck}" has no file in any language`);
    }
  }

  console.log(`${files} deck files checked: ${errors} error(s), ${warnings} warning(s)`);
  if (errors > 0) process.exit(1);
}

main();
