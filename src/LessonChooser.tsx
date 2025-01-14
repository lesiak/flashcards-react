import {Lesson} from './model/Lesson.ts';
import React from 'react';
import {LessonIndexCard} from './LessonIndexCard.tsx';

interface LessonChooserProps {
  lessons: Lesson[];
  onLessonSelected: (lesson: Lesson) => void;
}

export const LessonChooser: React.FC<LessonChooserProps> = ({lessons, onLessonSelected}) => {
  return (
    <div>
      <h1>Fluent UI Grid</h1>
      <div class="fl-grid">
      {lessons.map(lesson =>
        // onClick={() => setCurrentLesson(lesson)}
        <div key={`${lesson.name}`} className="lesson-card fl-span4" onClick={() => onLessonSelected(lesson)}>
          <LessonIndexCard lesson={lesson}/>
        </div>)
      }
      </div>
    </div>
  )
}


