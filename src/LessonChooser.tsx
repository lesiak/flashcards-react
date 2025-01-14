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
  <div class="fl-span12">
    This should be 12 columns.
  </div>
  <div class="fl-span4">
    This should be 4 columns.
  </div>
  <div class="fl-span8">
    This should be 8 columns.
  </div>
  <div class="fl-span6c">
    6 columns centered
  </div>
    <div class="fl-span8c">
    8 columns centered
  </div>

      {lessons.map(lesson =>
        // onClick={() => setCurrentLesson(lesson)}
        <div key={`${lesson.name}`} className="lesson-card fl-span8c" onClick={() => onLessonSelected(lesson)}>
          <LessonIndexCard lesson={lesson}/>
        </div>)
      }
  
  
</div>
</div>
  )
}


