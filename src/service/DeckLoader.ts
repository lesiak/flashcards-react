import {Course, Lesson, Section} from '../model/Lesson.ts';

/** Shape of public/wordfiles/Lessons.json: the courses, their sections and the deck names every language may provide. */
export interface DeckIndex {
  courses: CourseIndex[];
}

export interface CourseIndex {
  /** Folder name under each language, e.g. "words" or "a1". Also the audio group. */
  id: string;
  /** Name shown when choosing a course. */
  name: string;
  sections: SectionIndex[];
}

export interface SectionIndex {
  /** Heading shown above the section's decks. */
  name: string;
  /** Deck file names without ".json", all in the course folder. */
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
  // Every language lists the same cards; one with an empty word is not translated yet and is not shown.
  lesson.cards = lesson.cards.filter((card) => card.word !== undefined && card.word.length > 0);
  if (lesson.cards.length === 0) {
    throw new Error(`Deck ${deckUrl} has no translated cards`);
  }
  lesson.group = group;
  lesson.id = `${group}/${deck}`;
  return lesson;
}

async function loadSection(lang: string, course: CourseIndex, section: SectionIndex): Promise<Section> {
  const maybeLessons = await Promise.all(section.decks.map((deck) =>
    loadLesson(lang, course.id, deck).catch((e) => {
      console.log(`Skipping deck ${course.id}/${deck} for ${lang}`, e);
      return null;
    })));
  return {name: section.name, lessons: maybeLessons.filter((l): l is Lesson => l !== null)};
}

/**
 * Loads every deck the index lists for `lang`. A deck the language has no
 * file for is skipped, a section left with no decks is dropped, and so is a
 * course left with no sections.
 */
export async function loadCourses(lang: string, index: DeckIndex): Promise<Course[]> {
  const courses = await Promise.all(index.courses.map(async (course) => {
    const sections = await Promise.all(course.sections.map((section) => loadSection(lang, course, section)));
    return {id: course.id, name: course.name, sections: sections.filter((s) => s.lessons.length > 0)};
  }));
  return courses.filter((c) => c.sections.length > 0);
}
