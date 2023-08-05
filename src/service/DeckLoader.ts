import {Lesson} from '../model/Lesson.ts';
import {LanguageInfo} from '../model/LanguageInfo.ts';

export async function loadLesson(lang: string, deckName: string): Promise<Lesson> {
  const deckUrl = `wordfiles/${lang}/${deckName}.json`;
  const resp = await fetch(deckUrl);
  if (!resp.ok) {
    throw new Error(`Cannot load deck ${deckUrl}`);
  }
  return await resp.json() as Lesson;
}



export function loadAllDLessonsIgnoringErrors(lang: LanguageInfo, deckNames: string[]): Promise<Lesson[]> {
  const loadDeckIgnoringErrors = (deckName: string) => loadLesson(lang.code, deckName)
    .catch(e => {
      console.log('AAA', e);
      return null;
    });

  const loadTasks = deckNames.map(loadDeckIgnoringErrors);
  return Promise.all(loadTasks).then(maybeLessons => maybeLessons.filter(l => l !== null)) as Promise<Lesson[]>;
}