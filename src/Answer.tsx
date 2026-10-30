import React from 'react';
import {makeStyles, tokens} from '@fluentui/react-components';
import {Card} from './model/Card.ts';

const useStyles = makeStyles({
  alternatives: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'baseline',
    columnGap: '0.4em',
  },
  alternative: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  romanization: {
    // Sized relative to the word so it stays discreet both on the card and in the dictionary.
    fontSize: '0.6em',
    lineHeight: 1.4,
    fontFamily: tokens.fontFamilyBase,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground3,
  },
  separator: {
    color: tokens.colorNeutralForeground4,
  },
});

/**
 * A card's word as written. When the card has a romanization, each "|"
 * alternative is shown with its own reading under it.
 */
export const Answer: React.FC<{card: Card}> = ({card}) => {
  const styles = useStyles();
  if (!card.romanization) {
    return <>{card.word}</>;
  }
  const readings = card.romanization.split('|').map((r) => r.trim());
  return (
    <span className={styles.alternatives}>
      {card.word.split('|').map((alt, i) =>
        <React.Fragment key={i}>
          {i > 0 && <span className={styles.separator}>|</span>}
          <span className={styles.alternative}>
            <span>{alt.trim()}</span>
            {readings[i] && <span className={styles.romanization} dir="ltr">{readings[i]}</span>}
          </span>
        </React.Fragment>)}
    </span>
  );
};
