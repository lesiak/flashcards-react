import {Body1, Caption1, Card, CardHeader, CardPreview, Image, makeStyles, tokens} from '@fluentui/react-components';
import React from 'react';

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
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase500,
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
        {image && <Image fit="cover" src={image + '?width=1920'} alt={title}/>}
        {!image && <div className={styles.placeholder}>{title}</div>}
      </CardPreview>
    </Card>
  );
};
