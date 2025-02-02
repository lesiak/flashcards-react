import {
  makeStyles,
  Body1,
  Caption1,
  Image,
} from "@fluentui/react-components";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {Lesson} from './model/Lesson.ts';
import React from 'react';

interface LessonIndexCardProps {
  lesson: Lesson;
}

const useStyles = makeStyles({
  card: {
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
        description={<Caption1>Card description</Caption1>}
      />

      <CardPreview>
        {lesson.image && <Image
            fit='cover'
            src={lesson.image + "?width=1920"}
            alt={lesson.description}
        />}
        {!lesson.image && <div>{lesson.name}</div>}
      </CardPreview>

      <CardFooter>
        Status
      </CardFooter>
    </Card>
  );
};