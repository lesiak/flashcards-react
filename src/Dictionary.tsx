import React, {useState} from 'react';

import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell, Input, useId,
  Button, Tooltip, makeStyles, tokens,
} from '@fluentui/react-components';
import {SearchRegular, Speaker2Regular} from '@fluentui/react-icons';

import {Card} from './model/Card';
import {LanguageInfo} from './model/LanguageInfo';
import {AudioManifestEntry} from './model/AudioManifest.ts';
import {useMergedAudioClips} from './service/AudioManifestLoader.ts';
import {findPronunciations, playPronunciation} from './service/Pronunciation.ts';
import {Answer} from './Answer.tsx';


type DictionaryTableProps = {
  cards: Card[]
  /** Course ids (deck groups) the cards come from, whose audio is looked up. */
  groups: string[]
  currentLanguage: LanguageInfo
}

const useStyles = makeStyles({
  clips: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: tokens.spacingHorizontalXS,
  },
});

/** Lower case without accents or tone marks, so "hai" finds "hǎi". */
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function deduplicateByProperty<T, K>(elements: T[], getProperty: (element: T) => K): T[] {
  return elements.reduce((acc: T[], current: T) => {
    const property = getProperty(current);
    if (!acc.some(item => getProperty(item) === property)) {
      acc.push(current);
    }
    return acc;
  }, []);
}

/** One icon button for a single recording; labelled buttons when there are alternatives to tell apart. */
const PronunciationButtons: React.FunctionComponent<{pronunciations: AudioManifestEntry[]}> = ({pronunciations}) => {
  const styles = useStyles();

  if (pronunciations.length === 1) {
    const [entry] = pronunciations;
    return (
      <Tooltip content={entry.text} relationship="label">
        <Button appearance="subtle" size="small" icon={<Speaker2Regular/>} onClick={() => playPronunciation(entry)}/>
      </Tooltip>
    );
  }
  return (
    <div className={styles.clips}>
      {pronunciations.map((entry) => (
        <Button key={entry.file} appearance="subtle" size="small" icon={<Speaker2Regular/>}
                onClick={() => playPronunciation(entry)}>
          {entry.text}
        </Button>
      ))}
    </div>
  );
};

export const Dictionary: React.FunctionComponent<DictionaryTableProps> = ({cards, groups, currentLanguage}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchTermInputId = useId("search-term-input");
  const clips = useMergedAudioClips(currentLanguage.code, groups);

  const filteredCards = deduplicateByProperty(cards, card => card.en)
    .filter(card => card.en.includes(searchTerm) || card.word.includes(searchTerm)
      || (card.romanization !== undefined && fold(card.romanization).includes(fold(searchTerm))))
    .sort((c1, c2) => c1.en.localeCompare(c2.en));

  return (
    <>
      <div>
        <Input id={searchTermInputId}
               contentBefore={<SearchRegular />}
               onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span>Word count: {cards.length}</span>
      </div>
      <Table arial-label="Default table">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>English</TableHeaderCell>
            <TableHeaderCell>{currentLanguage.fullName}</TableHeaderCell>
            <TableHeaderCell>Pronunciation</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCards.map((card) => (
            <TableRow key={card.en}>
              <TableCell>{card.en}</TableCell>
              <TableCell className={currentLanguage.code === 'he' ? 'hebrewFont' : undefined}
                         dir={currentLanguage.rtl ? 'rtl' : undefined}>
                <Answer card={card}/>
              </TableCell>
              <TableCell>
                <PronunciationButtons pronunciations={findPronunciations(clips, card.word)}/>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
