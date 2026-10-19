import {Card} from './Card.ts';

/** One deck file, public/wordfiles/<lang>/<group>/<deck>.json, plus where it was loaded from. */
export interface Lesson {
  name: string;
  description: string;
  image?: string;
  cards: Card[];
  /** Set by the loader: the folder the deck lives in, i.e. the course id, e.g. "a1". Also the audio group. */
  group: string;
  /** Set by the loader: "<group>/<deck>", unique across courses, e.g. "a1/A1_Level_Part1". */
  id: string;
}

/**
 * Decks shown together under one heading inside a course. Sections exist
 * only in Lessons.json: the deck files stay in the course folder, so moving
 * a deck between sections touches no file and no audio.
 */
export interface Section {
  name: string;
  lessons: Lesson[];
}

/** A deck folder under each language (words, a1), chosen first in the app. */
export interface Course {
  id: string;
  name: string;
  sections: Section[];
}
