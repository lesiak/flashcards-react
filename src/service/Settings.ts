/**
 * Small user preferences kept in localStorage so they survive an app restart.
 * Storage can be unavailable (private window, blocked site data), so every
 * access is guarded and a failure just means the default.
 */

const COURSE_KEY = 'flashcards.course';
const LANGUAGE_KEY = 'flashcards.language';

function load(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not remembered this time; the default applies on the next start.
  }
}

/** Id of the course the user last opened, or null when none is stored. */
export const loadStoredCourse = (): string | null => load(COURSE_KEY);
export const storeCourse = (courseId: string): void => store(COURSE_KEY, courseId);

/** Code of the language the user last picked, or null when none is stored. */
export const loadStoredLanguage = (): string | null => load(LANGUAGE_KEY);
export const storeLanguage = (code: string): void => store(LANGUAGE_KEY, code);
