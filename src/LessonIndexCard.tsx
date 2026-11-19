import {
  makeStyles,
  Body1,
  Caption1,
} from "@fluentui/react-components";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {Lesson} from './model/Lesson.ts';
import React from 'react';
import {CardCover} from './CardCover.tsx';

interface LessonIndexCardProps {
  lesson: Lesson;
}

const useStyles = makeStyles({
  card: {
    width: '100%',
    //...shorthands.margin("10px", "auto"),
    //width: "720px",
    //maxWidth: "100%",
  },
});

export const LessonIndexCard: React.FC<LessonIndexCardProps> = ({lesson}) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <Body1>
            <b>{lesson.name}</b>
          </Body1>
        }
        description={<Caption1>{lesson.cards.length} {lesson.cards.length === 1 ? 'word' : 'words'}</Caption1>}
      />

      <CardPreview>
        <CardCover image={lesson.image} title={lesson.name}/>
      </CardPreview>

      {/* Placeholder for the deck's study progress. */}
      <CardFooter>
        Status
      </CardFooter>
    </Card>
  );
};