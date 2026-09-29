import React, {useEffect, useState} from 'react';
import {LanguageInfo} from './model/LanguageInfo.ts';
import {Lesson} from './model/Lesson.ts';
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from '@fluentui/react-components';
import {getForvoPronunciations} from './service/PronounciationManager.ts';
import {ForvoItem, ForvoResponse} from './model/forvo/Forvo.ts';
import {sanitizeWordEntry} from "./service/CardUtils.ts";
import { makeStyles } from '@fluentui/react-components';
import {useAudioManifest} from './service/AudioManifestLoader.ts';
import {playCachedAudio} from './service/AudioCache.ts';
import {audioUrl} from './service/AudioNaming.ts';
import {AudioManifestEntry} from './model/AudioManifest.ts';

// Stable empty list so effects depending on it do not re-run every render.
const NO_TTS_ENTRIES: AudioManifestEntry[] = [];

const playAudio = (url: string): Promise<void> => {
  return new Audio(url).play();
}

const playTts = (entry: AudioManifestEntry) => {
  playCachedAudio(audioUrl(entry.file)).catch((e) => console.warn(`Cannot play "${entry.text}"`, e));
}

const getProno = async (lang: LanguageInfo, word: string): Promise<ForvoItem[]> => {
  const resp = await getForvoPronunciations(lang.code, word);
  console.log(resp.ok);
  const body: ForvoResponse = await resp.json();
  console.log("AAA respJson", body);
  console.log("AAA respJson items", body.items);
  return body.items;
}

const poorPronoUsers: Record<string, readonly string[]> = {
  'tr': ['rogers']
} as const;


const filterOutPoorProno = (lang: LanguageInfo, items: ForvoItem[]): ForvoItem[] => {
  const poorUsersForLang = poorPronoUsers[lang.code] ?? [];
  const filteredItems =  items.filter(item => !poorUsersForLang.includes(item.username));
  return filteredItems ? filteredItems : items;
}

const useStyles = makeStyles({
  qaCardPreview: {
    minHeight: '200px',
  },
  qaCardPreviewContents: {
    marginLeft: '10px'
  }
});

export const LessonPage: React.FC<{currentLanguage: LanguageInfo, lesson: Lesson}> = ({currentLanguage, lesson}) => {
  const classes = useStyles();
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [pronos, setPronos] = useState([] as ForvoItem[]);
  const card = lesson.cards[currentCardIdx];
  const audioManifest = useAudioManifest(currentLanguage.code);
  const ttsEntries = audioManifest?.entries[card.word] ?? NO_TTS_ENTRIES;



  useEffect(() => {
    async function getAndPlaySounds() {
      const sanitizedWord = sanitizeWordEntry(currentLanguage.code, card.word);
      const items = await getProno(currentLanguage, sanitizedWord);
      const goodPronos = filterOutPoorProno(currentLanguage, items);
      setPronos(goodPronos);
    }
    getAndPlaySounds();
  }, [card.word, currentLanguage]);

  // Autoplay when the answer is revealed: generated TTS first, Forvo as fallback.
  useEffect(() => {
    if (!showAnswer) {
      return;
    }
    if (ttsEntries.length > 0) {
      playTts(ttsEntries[0]);
    } else if (pronos.length > 0) {
      playAudio(pronos[0].pathmp3).catch((e) => console.warn('Autoplay blocked', e));
    }
  }, [card.word, currentLanguage, showAnswer, ttsEntries, pronos]);



  const gotoNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIdx((prevIdx) => (prevIdx +1) % lesson.cards.length);
    setPronos([]);
  }

  const onShowAnswerClicked = () => {
    setShowAnswer(true);
  }

  return <>
    <div>
      <Card>
        <CardHeader
          image={<img
            src={currentLanguage.flagUrl}
            width={32}
            height={32}
          />}
        />
        <CardPreview className={classes.qaCardPreview}>

          <div className={classes.qaCardPreviewContents}> {/* needed because CardPreview gives its child 100 */}
          <h1>{card.en}</h1>
          {showAnswer &&  <h1>{card.word}</h1>}
          {showAnswer &&
              <div>
              {ttsEntries.map((entry) => (
                <Button key={entry.file} appearance="primary" onClick={() => playTts(entry)}>
                  🔊 {entry.text}
                </Button>
              ))}
              {pronos.map((fItem => (
                <Button key={`${card.word}-${fItem.username}`}
                        onClick={() => playAudio(fItem.pathmp3)}>
                  {fItem.username} - {fItem.country}
                </Button>
                )))}
              </div>

          }
          </div>
        </CardPreview>

        <CardFooter>
          {!showAnswer ? <Button onClick={onShowAnswerClicked}>Show Answer</Button> :
            <Button onClick={gotoNextCard}>Next</Button>}

        </CardFooter>
      </Card>
    </div>
  </>
}