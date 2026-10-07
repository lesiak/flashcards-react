import {Card} from './Card.ts';

/** One deck file, public/wordfiles/<lang>/<group>/<deck>.json, plus where it was loaded from. */
export interface Lesson {
  name: string;
  description: string;
  image?: string;
  cards: Card[];
  /** Set by the loader: the group folder, e.g. "a1". */
  group: string;
  /** Set by the loader: "<group>/<deck>", unique across groups, e.g. "a1/A1_Level_Part1". */
  id: string;
}

/** A group of decks shown together under one heading, e.g. the A1 course. */
export interface LessonGroup {
  id: string;
  name: string;
  lessons: Lesson[];
}
