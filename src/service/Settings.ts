/**
 * Small user preferences kept in localStorage so they survive an app restart.
 * Storage can be unavailable (private window, blocked site data), so every
 * access is guarded and a failure just means the default.
 */

const COURSE_KEY = 'flashcards.course';

/** Id of the course the user last opened, or null when none is stored. */
export function loadStoredCourse(): string | null {
  try {
    return window.localStorage.getItem(COURSE_KEY);
  } catch {
    return null;
  }
}

export function storeCourse(courseId: string): void {
  try {
    window.localStorage.setItem(COURSE_KEY, courseId);
  } catch {
    // Not remembered this time; the chooser is shown again on the next start.
  }
}
