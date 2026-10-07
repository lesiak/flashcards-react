import {Lesson, LessonGroup} from '../model/Lesson.ts';

/** Shape of public/wordfiles/Lessons.json: the groups and deck names every language may provide. */
export interface DeckIndex {
  groups: DeckGroupIndex[];
}

export interface DeckGroupIndex {
  /** Folder name under each language, e.g. "words" or "a1". */
  id: string;
  /** Heading shown above the group's decks. */
  name: string;
  /** Deck file names without ".json". */
  decks: string[];
}

export async function loadDeckIndex(): Promise<DeckIndex> {
  const url = 'wordfiles/Lessons.json';
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Cannot load deck index ${url}`);
  }
  return await resp.json() as DeckIndex;
}

export async function loadLesson(lang: string, group: string, deck: string): Promise<Lesson> {
  const deckUrl = `wordfiles/${lang}/${group}/${deck}.json`;
  const resp = await fetch(deckUrl);
  if (!resp.ok) {
    throw new Error(`Cannot load deck ${deckUrl}`);
  }
  const lesson = await resp.json() as Lesson;
  for (const card of lesson.cards) {
    if (card.en === undefined || card.word === undefined) {
      console.log(`Invalid deck ${deckUrl}`);
    }
  }
  lesson.group = group;
  lesson.id = `${group}/${deck}`;
  return lesson;
}

/**
 * Loads every deck the index lists for `lang`. A deck the language has no
 * file for is skipped, and a group left with no decks is dropped.
 */
export async function loadLessonGroups(lang: string, index: DeckIndex): Promise<LessonGroup[]> {
  const groups = await Promise.all(index.groups.map(async (group) => {
    const maybeLessons = await Promise.all(group.decks.map((deck) =>
      loadLesson(lang, group.id, deck).catch((e) => {
        console.log(`Skipping deck ${group.id}/${deck} for ${lang}`, e);
        return null;
      })));
    const lessons = maybeLessons.filter((l): l is Lesson => l !== null);
    return {id: group.id, name: group.name, lessons};
  }));
  return groups.filter((g) => g.lessons.length > 0);
}
