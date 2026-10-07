import {Lesson, LessonGroup} from './model/Lesson.ts';
import React from 'react';
import {LessonIndexCard} from './LessonIndexCard.tsx';
import {makeStyles, Subtitle1, tokens} from '@fluentui/react-components';

interface LessonChooserProps {
  groups: LessonGroup[];
  onLessonSelected: (lesson: Lesson) => void;
}

const useStyles = makeStyles({
  heading: {
    display: 'block',
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalXS,
    marginLeft: '0.5rem',
  },
});

export const LessonChooser: React.FC<LessonChooserProps> = ({groups, onLessonSelected}) => {
  const styles = useStyles();
  return (
    <>
      {groups.map((group) =>
        <section key={group.id}>
          <Subtitle1 as="h2" className={styles.heading}>{group.name}</Subtitle1>
          <div className="fl-grid">
            {group.lessons.map((lesson) =>
              <div key={lesson.id} className="lesson-card fl-span4" onClick={() => onLessonSelected(lesson)}>
                <LessonIndexCard lesson={lesson}/>
              </div>)}
          </div>
        </section>)}
    </>
  );
};
