import {Image, makeStyles, mergeClasses, tokens} from '@fluentui/react-components';
import React from 'react';

interface CardCoverProps {
  image?: string;
  /** The image's alt text. */
  title: string;
}

const useStyles = makeStyles({
  // Every cover takes the same box, so cards in a row line up whatever the image size.
  cover: {
    display: 'block',
    width: '100%',
    aspectRatio: '16 / 9',
  },
  // Without an image the card's title, drawn over the cover, is all it shows.
  placeholder: {
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackgroundPressed})`,
  },
});

/** The 16:9 picture of a course, section or deck card; the image is cropped to fill it. */
export const CardCover: React.FC<CardCoverProps> = ({image, title}) => {
  const styles = useStyles();
  if (!image) {
    return <div className={mergeClasses(styles.cover, styles.placeholder)}/>;
  }
  return <Image className={styles.cover} fit="cover" src={image + '?width=1920'} alt={title}/>;
};
