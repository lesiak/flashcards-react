import {Lesson} from './model/Lesson.ts';
import React from 'react';
import {LessonIndexCard} from './LessonIndexCard.tsx';

interface LessonChooserProps {
  lessons: Lesson[];
  onLessonSelected: (lesson: Lesson) => void;
}

/** The decks of one section as a grid of tiles. */
export const LessonChooser: React.FC<LessonChooserProps> = ({lessons, onLessonSelected}) => {
  return (
    <div className="fl-grid">
      {lessons.map((lesson) =>
        <div key={lesson.id} className="lesson-card fl-span4" onClick={() => onLessonSelected(lesson)}>
          <LessonIndexCard lesson={lesson}/>
        </div>)}
    </div>
  );
};
