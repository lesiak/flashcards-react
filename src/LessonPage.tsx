import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LanguageInfo} from './model/LanguageInfo.ts';
import {Lesson} from './model/Lesson.ts';
import {
  Button,
  Image,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {ChevronLeftRegular, ChevronRightRegular, Speaker2Regular} from '@fluentui/react-icons';
import {useAudioManifest} from './service/AudioManifestLoader.ts';
import {playCachedAudio} from './service/AudioCache.ts';
import {audioUrl, deriveVoicedTexts} from './service/AudioNaming.ts';
import {AudioManifestEntry} from './model/AudioManifest.ts';

// Stable empty list so effects depending on it do not re-run every render.
const NO_PRONUNCIATIONS: AudioManifestEntry[] = [];

const playPronunciation = (entry: AudioManifestEntry) => {
  playCachedAudio(audioUrl(entry.file)).catch((e) => console.warn(`Cannot play "${entry.text}"`, e));
}

const useStyles = makeStyles({
  page: {
    paddingTop: tokens.spacingVerticalL,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.overflow('hidden'),
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
  },
  lessonLink: {
    fontWeight: tokens.fontWeightSemibold,
  },
  position: {
    marginLeft: 'auto',
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  flag: {
    objectFit: 'cover',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: tokens.spacingVerticalM,
    minHeight: '200px',
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalL, tokens.spacingVerticalL),
  },
  prompt: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.margin(0),
  },
  answer: {
    fontSize: tokens.fontSizeBase600,
    lineHeight: tokens.lineHeightBase600,
    minHeight: tokens.lineHeightBase600,
    ...shorthands.margin(0),
  },
  hidden: {
    visibility: 'hidden',
  },
  hebrew: {
    fontFamily: "'Noto Sans Hebrew', sans-serif",
  },
  note: {
    maxWidth: '36em',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    ...shorthands.margin(0),
  },
  clips: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: tokens.spacingHorizontalS,
    rowGap: tokens.spacingVerticalS,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
  },
});

interface LessonPageProps {
  currentLanguage: LanguageInfo;
  lesson: Lesson;
  /** Called when the learner leaves the lesson, or after the last card. */
  onClose: () => void;
}

export const LessonPage: React.FC<LessonPageProps> = ({currentLanguage, lesson, onClose}) => {
  const styles = useStyles();
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const card = lesson.cards[currentCardIdx];
  const isLastCard = currentCardIdx === lesson.cards.length - 1;
  const audioManifest = useAudioManifest(currentLanguage.code, lesson.group);
  // One clip per voiced alternative that has a recording. Memoised so the
  // autoplay effect below sees the same list until the card or manifest changes.
  const pronunciations = useMemo<AudioManifestEntry[]>(() => {
    if (!audioManifest) return NO_PRONUNCIATIONS;
    const found = deriveVoicedTexts(card.word)
      .map((text) => ({text, file: audioManifest.clips[text]}))
      .filter((entry): entry is AudioManifestEntry => entry.file !== undefined);
    return found.length > 0 ? found : NO_PRONUNCIATIONS;
  }, [audioManifest, card.word]);

  // Autoplay the first pronunciation when the answer is revealed.
  useEffect(() => {
    if (showAnswer && pronunciations.length > 0) {
      playPronunciation(pronunciations[0]);
    }
  }, [showAnswer, pronunciations]);

  const revealAnswer = useCallback(() => setShowAnswer(true), []);

  const gotoNextCard = useCallback(() => {
    if (isLastCard) {
      onClose();
      return;
    }
    setShowAnswer(false);
    setCurrentCardIdx((prevIdx) => prevIdx + 1);
  }, [isLastCard, onClose]);

  // Space reveals, Enter or Right arrow advances. Ignored while a control has focus,
  // so a focused button is not triggered twice.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest('button, input, textarea, a, [role="menu"]')) {
        return;
      }
      if (e.key === ' ' && !showAnswer) {
        e.preventDefault();
        revealAnswer();
      } else if ((e.key === 'Enter' || e.key === 'ArrowRight') && showAnswer) {
        e.preventDefault();
        gotoNextCard();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAnswer, revealAnswer, gotoNextCard]);

  const answerClass = mergeClasses(
    styles.answer,
    !showAnswer && styles.hidden,
    currentLanguage.code === 'he' && styles.hebrew,
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Button appearance="transparent"
                  icon={<ChevronLeftRegular/>}
                  className={styles.lessonLink}
                  onClick={onClose}
                  aria-label={`Leave lesson ${lesson.name}`}>
            {lesson.name}
          </Button>
          <span className={styles.position}>{currentCardIdx + 1} / {lesson.cards.length}</span>
          <Image src={currentLanguage.flagUrl}
                 alt={currentLanguage.fullName}
                 shape="circular"
                 bordered
                 width={24}
                 height={24}
                 className={styles.flag}/>
        </div>

        <div className={styles.body}>
          <h1 className={styles.prompt}>{card.en}</h1>
          <p className={answerClass}
             dir={currentLanguage.rtl ? 'rtl' : undefined}
             aria-hidden={!showAnswer}>
            {card.word}
          </p>

          {showAnswer && pronunciations.length > 0 &&
            <div className={styles.clips}>
              {pronunciations.map((entry) => (
                <Button key={entry.file}
                        appearance="primary"
                        icon={<Speaker2Regular/>}
                        onClick={() => playPronunciation(entry)}>
                  {entry.text}
                </Button>
              ))}
            </div>
          }

          {showAnswer && card.note &&
            <p className={styles.note}>{card.note}</p>
          }
        </div>

        <div className={styles.footer}>
          {!showAnswer
            ? <Button appearance="primary" onClick={revealAnswer}>Show answer</Button>
            : <Button appearance="primary" icon={<ChevronRightRegular/>} iconPosition="after" onClick={gotoNextCard}>
                {isLastCard ? 'Finish' : 'Next'}
              </Button>}
        </div>
      </div>
    </div>
  );
}
