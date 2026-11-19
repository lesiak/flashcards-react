import {Body1, Caption1, Card, CardHeader, CardPreview, makeStyles} from '@fluentui/react-components';
import React from 'react';
import {CardCover} from './CardCover.tsx';

interface IndexCardProps {
  title: string;
  /** Short line under the title, e.g. "7 decks". */
  subtitle?: string;
  image?: string;
  onClick: () => void;
}

const useStyles = makeStyles({
  card: {
    width: '100%',
    cursor: 'pointer',
  },
});

/** A clickable tile for a course or a section; decks use LessonIndexCard. */
export const IndexCard: React.FC<IndexCardProps> = ({title, subtitle, image, onClick}) => {
  const styles = useStyles();
  return (
    <Card className={styles.card} onClick={onClick}>
      <CardHeader
        header={<Body1><b>{title}</b></Body1>}
        description={subtitle && <Caption1>{subtitle}</Caption1>}
      />
      <CardPreview>
        <CardCover image={image} title={title}/>
      </CardPreview>
    </Card>
  );
};
