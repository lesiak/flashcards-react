import React, {useState} from 'react';
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

const getProno = async (lang: LanguageInfo, word: string): Promise<ForvoItem[]> => {
  const resp = await getForvoPronunciations(lang.code, word);
  console.log(resp.ok);
  const body: ForvoResponse = await resp.json();
  console.log("AAA respJson", body);
  console.log("AAA respJson items", body.items);
  return body.items;
}


export const LessonPage: React.FC<{currentLanguage: LanguageInfo, lesson: Lesson}> = ({currentLanguage, lesson}) => {

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [pronos, setPronos] = useState([] as ForvoItem[]);


  const card = lesson.cards[currentCardIdx];

  const gotoNextCard = () => {
    setCurrentCardIdx((prevIdx) => (prevIdx +1) % lesson.cards.length);
    setPronos([]);
  }

  return <>
    <Card>
      <CardHeader
        image={<img
          src={currentLanguage.flagUrl}
          width={32}
          height={32}
        />}
      />
      <CardPreview>
        <h1>{card.en}</h1>
        <h1>{card.word}</h1>
        {pronos.map((fi => (<figure>
          <figcaption>{fi.username} - {fi.country}</figcaption>
          <audio controls src={fi.pathmp3}>
            <a href={fi.pathmp3}> Download audio </a>
          </audio>
        </figure>)))}
      </CardPreview>

      <CardFooter>
        <Button onClick={gotoNextCard}>Next</Button>
        <Button onClick={() => getProno(currentLanguage, card.word).then(items => setPronos(items))}>Get Prono</Button>

      </CardFooter>
    </Card>
    </>
}