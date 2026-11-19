import {Image, makeStyles, tokens} from '@fluentui/react-components';
import React from 'react';

interface CardCoverProps {
  image?: string;
  /** Shown in the placeholder when there is no image, and as the image's alt text. */
  title: string;
}

const useStyles = makeStyles({
  // Every cover takes the same box, so cards in a row line up whatever the image size.
  cover: {
    width: '100%',
    aspectRatio: '16 / 9',
  },
  // Inside the cover box: CardPreview sets its own children to display: block.
  placeholder: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase500,
  },
});

/** The 16:9 picture of a course, section or deck card; the image is cropped to fill it. */
export const CardCover: React.FC<CardCoverProps> = ({image, title}) => {
  const styles = useStyles();
  if (!image) {
    return <div className={styles.cover}><div className={styles.placeholder}>{title}</div></div>;
  }
  return <Image className={styles.cover} fit="cover" src={image + '?width=1920'} alt={title}/>;
};
