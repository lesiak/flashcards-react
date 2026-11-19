import {
  makeStyles,
  Body1,
  Caption1,
  tokens,
} from "@fluentui/react-components";
import {
  Card,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {Lesson} from './model/Lesson.ts';
import React from 'react';
import {CardCover} from './CardCover.tsx';

interface LessonIndexCardProps {
  lesson: Lesson;
}

/** Shown for every deck until study progress is tracked. */
const PLACEHOLDER_PROGRESS = 0.2;

const useStyles = makeStyles({
  card: {
    width: '100%',
    //...shorthands.margin("10px", "auto"),
    //width: "720px",
    //maxWidth: "100%",
  },
  badge: {
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'color-mix(in srgb, var(--app-progress) 20%, transparent)',
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  preview: {
    position: 'relative',
  },
  // A thin bar along the bottom edge of the image, in the scheme's --app-progress.
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '4px',
    backgroundColor: 'color-mix(in srgb, var(--app-progress) 25%, transparent)',
  },
  bar: {
    height: '100%',
    backgroundColor: 'var(--app-progress)',
  },
});

export const LessonIndexCard: React.FC<LessonIndexCardProps> = ({lesson}) => {
  const styles = useStyles();
  const percent = Math.round(PLACEHOLDER_PROGRESS * 100);

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <Body1>
            <b>{lesson.name}</b>
          </Body1>
        }
        description={<Caption1>{lesson.cards.length} {lesson.cards.length === 1 ? 'word' : 'words'}</Caption1>}
        action={<Caption1 className={styles.badge}>{percent}%</Caption1>}
      />

      <CardPreview>
        <div className={styles.preview}>
          <CardCover image={lesson.image} title={lesson.name}/>
          <div className={styles.track} role="progressbar" aria-label="Progress"
               aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <div className={styles.bar} style={{width: `${percent}%`}}/>
          </div>
        </div>
      </CardPreview>
    </Card>
  );
};
