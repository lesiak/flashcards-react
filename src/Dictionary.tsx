import React, {useState} from 'react';

import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell, Input, useId,
} from '@fluentui/react-components';
import {SearchRegular} from '@fluentui/react-icons';

import {Card} from './model/Card';
import {LanguageInfo} from './model/LanguageInfo';

import './Dictionary.css'

type DictionaryTableProps = {
  cards: Card[]
  currentLanguage: LanguageInfo
}

export const Dictionary: React.FunctionComponent<DictionaryTableProps> = ({cards, currentLanguage}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchTermInputId = useId("search-term-input");

  const filteredCards = cards
    .filter(card => card.en.includes(searchTerm) || card.word.includes(searchTerm))
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCards.map((card) => (
            <TableRow key={card.en}>
              <TableCell>{card.en}</TableCell>
              <TableCell className='hebrewFont'>{card.word}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};