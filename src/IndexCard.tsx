import {Body1, Caption1, Card, makeStyles, tokens} from '@fluentui/react-components';
import React from 'react';
import {CardCover} from './CardCover.tsx';

interface IndexCardProps {
  title: string;
  /** Short line under the title, e.g. "7 decks". */
  subtitle?: string;
  image?: string;
  /** Shown at the right of the title, e.g. a deck's study progress. */
  action?: React.ReactNode;
  onClick?: () => void;
}

const useStyles = makeStyles({
  card: {
    width: '100%',
    padding: 0,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  // A dark gradient over the bottom of the image keeps the white text readable on any picture.
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalM}`,
    backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.72))',
    color: tokens.colorNeutralForegroundOnBrand,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  action: {
    flexShrink: 0,
  },
});

/** A tile for a course, a section or a deck: the cover with its title over the bottom. */
export const IndexCard: React.FC<IndexCardProps> = ({title, subtitle, image, action, onClick}) => {
  const styles = useStyles();
  return (
    <Card className={styles.card} onClick={onClick}>
      <CardCover image={image} title={title}/>
      <div className={styles.overlay}>
        <div className={styles.text}>
          <Body1><b>{title}</b></Body1>
          {subtitle && <Caption1>{subtitle}</Caption1>}
        </div>
        {action && <Caption1 className={styles.action}>{action}</Caption1>}
      </div>
    </Card>
  );
};
