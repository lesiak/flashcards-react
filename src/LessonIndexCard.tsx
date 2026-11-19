import {Lesson} from './model/Lesson.ts';
import React from 'react';
import {IndexCard} from './IndexCard.tsx';

interface LessonIndexCardProps {
  lesson: Lesson;
}

/** A deck's tile: its cover, name and word count; LessonChooser handles the click. */
export const LessonIndexCard: React.FC<LessonIndexCardProps> = ({lesson}) => {
  const words = `${lesson.cards.length} ${lesson.cards.length === 1 ? 'word' : 'words'}`;
  // "Status" is a placeholder for the deck's study progress.
  return <IndexCard title={lesson.name} subtitle={words} image={lesson.image} action="Status"/>;
};
