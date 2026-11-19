import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LanguageInfo} from './model/LanguageInfo.ts';
import {Lesson} from './model/Lesson.ts';
import {
  Button,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {ChevronLeftRegular, ChevronRightRegular, Speaker2Regular} from '@fluentui/react-icons';
import {useAudioManifest} from './service/AudioManifestLoader.ts';
import {findPronunciations, playPronunciation} from './service/Pronunciation.ts';
import {AudioManifestEntry} from './model/AudioManifest.ts';
import {Answer} from './Answer.tsx';

// Stable empty list so effects depending on it do not re-run every render.
const NO_PRONUNCIATIONS: AudioManifestEntry[] = [];

/** Answers up to this many characters get the large size; a few characters or one word. */
const SHORT_ANSWER = 4;
/** Longer than this, the answer is a phrase or sentence and wraps at a reading size. */
const WORD_ANSWER = 16;

/**
 * Height above and below the page: the nav bar down to its bottom edge
 * (104px, body margin and #root padding included), then #root's bottom
 * padding (2rem) and the body's bottom margin (8px).
 */
const CHROME_HEIGHT = '144px';
const PAGE_MARGIN_TOP = '8px';
const PAGE_MARGIN_BOTTOM = 'clamp(24px, 5vh, 72px)';

const useStyles = makeStyles({
  // The card sits centred in the space under the nav bar, with a margin above and below.
  // The page fills the window exactly, so the card is never pushed below the fold.
  page: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: `calc(100dvh - ${CHROME_HEIGHT})`,
    ...shorthands.padding(PAGE_MARGIN_TOP, 0, PAGE_MARGIN_BOTTOM),
  },
  // A flashcard shape sized to the screen; a long answer may make it taller.
  card: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    width: `min(100%, 1100px, calc((100dvh - ${CHROME_HEIGHT} - ${PAGE_MARGIN_TOP} - ${PAGE_MARGIN_BOTTOM}) * 1.5))`,
    minWidth: 'min(100%, 640px)',
    aspectRatio: '3 / 2',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.overflow('hidden'),
    cursor: 'pointer',
    // Upright tablet: a tall card instead of a wide one.
    '@media (orientation: portrait)': {
      width: 'min(100%, 720px)',
      aspectRatio: 'auto',
      minHeight: `min(calc(100dvh - ${CHROME_HEIGHT} - ${PAGE_MARGIN_TOP} - ${PAGE_MARGIN_BOTTOM}), 960px)`,
    },
  },
  // How far through the deck: a thin bar along the top edge.
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: tokens.colorBrandBackground2,
  },
  bar: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    ...shorthands.padding('clamp(10px, 1.4vw, 20px)', 'clamp(12px, 2vw, 32px)', 0),
  },
  lessonLink: {
    fontWeight: tokens.fontWeightSemibold,
  },
  position: {
    marginLeft: 'auto',
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  // Question above a thin rule, answer below; the answer keeps its space while hidden.
  body: {
    display: 'grid',
    gridTemplateRows: '1fr auto 1.4fr',
    justifyItems: 'center',
    textAlign: 'center',
    ...shorthands.padding(0, 'clamp(18px, 3vw, 64px)'),
  },
  prompt: {
    alignSelf: 'end',
    maxWidth: '22em',
    fontSize: 'clamp(28px, 2.8vw, 56px)',
    lineHeight: 1.2,
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.margin(0),
    paddingBottom: 'clamp(12px, 2vh, 28px)',
  },
  longPrompt: {
    fontSize: 'clamp(24px, 2.2vw, 44px)',
  },
  rule: {
    width: 'min(60%, 420px)',
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  answerArea: {
    alignSelf: 'start',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 'clamp(8px, 1.4vh, 18px)',
    paddingTop: 'clamp(12px, 2.5vh, 32px)',
    paddingBottom: 'clamp(12px, 2.5vh, 32px)',
  },
  answer: {
    ...shorthands.margin(0),
    lineHeight: 1.1,
  },
  shortAnswer: {
    fontSize: 'clamp(64px, 7vw, 150px)',
    lineHeight: 1,
    '@media (orientation: portrait)': {
      fontSize: 'clamp(96px, 16vw, 170px)',
    },
  },
  wordAnswer: {
    fontSize: 'clamp(40px, 4.2vw, 88px)',
  },
  sentenceAnswer: {
    maxWidth: '20em',
    fontSize: 'clamp(28px, 2.8vw, 56px)',
    lineHeight: 1.25,
  },
  hidden: {
    visibility: 'hidden',
  },
  hebrew: {
    fontFamily: "'Noto Sans Hebrew', sans-serif",
  },
  note: {
    maxWidth: '38em',
    color: tokens.colorNeutralForeground3,
    fontSize: 'clamp(14px, 1.05vw, 18px)',
    lineHeight: 1.5,
    ...shorthands.margin(0),
  },
  clips: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: tokens.spacingHorizontalS,
    rowGap: tokens.spacingVerticalS,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalL,
    ...shorthands.padding(0, 'clamp(14px, 1.8vw, 28px)', 'clamp(14px, 1.8vw, 28px)'),
  },
  mainAction: {
    minWidth: 'min(320px, 60vw)',
    minHeight: '48px',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  key: {
    ...shorthands.padding('1px', '6px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    borderBottomWidth: '2px',
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    fontFamily: tokens.fontFamilyMonospace,
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
    const found = findPronunciations(audioManifest.clips, card.word);
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

  const answerLength = card.word.length;
  const answerClass = mergeClasses(
    styles.answer,
    answerLength <= SHORT_ANSWER ? styles.shortAnswer : answerLength <= WORD_ANSWER ? styles.wordAnswer : styles.sentenceAnswer,
    !showAnswer && styles.hidden,
    currentLanguage.code === 'he' && styles.hebrew,
  );

  // A tap anywhere on the card that is not a control reveals the answer, then moves on.
  const onCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (showAnswer) {
      gotoNextCard();
    } else {
      revealAnswer();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} onClick={onCardClick}>
        <div className={styles.track}>
          <div className={styles.bar} style={{width: `${(currentCardIdx + 1) / lesson.cards.length * 100}%`}}/>
        </div>
        <div className={styles.header}>
          <Button appearance="transparent"
                  icon={<ChevronLeftRegular/>}
                  className={styles.lessonLink}
                  onClick={onClose}
                  aria-label={`Leave lesson ${lesson.name}`}>
            {lesson.name}
          </Button>
          <span className={styles.position}>{currentCardIdx + 1} / {lesson.cards.length}</span>
        </div>

        <div className={styles.body}>
          <h1 className={mergeClasses(styles.prompt, card.en.length > 30 && styles.longPrompt)}>{card.en}</h1>
          <div className={styles.rule}/>
          <div className={styles.answerArea}>
            <p className={answerClass}
               dir={currentLanguage.rtl ? 'rtl' : undefined}
               aria-hidden={!showAnswer}>
              <Answer card={card}/>
            </p>

            {showAnswer && pronunciations.length > 0 &&
              <div className={styles.clips}>
                {pronunciations.map((entry) => (
                  <Button key={entry.file}
                          shape="circular"
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
        </div>

        <div className={styles.actions}>
          {!showAnswer
            ? <Button appearance="primary" size="large" className={styles.mainAction} onClick={revealAnswer}>
                Show answer
              </Button>
            : <Button appearance="primary" size="large" className={styles.mainAction}
                      icon={<ChevronRightRegular/>} iconPosition="after" onClick={gotoNextCard}>
                {isLastCard ? 'Finish' : 'Next'}
              </Button>}
          <span className={styles.hint}>
            <kbd className={styles.key}>{showAnswer ? '→' : 'Space'}</kbd> or tap the card
          </span>
        </div>
      </div>
    </div>
  );
}
