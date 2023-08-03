import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
} from '@fluentui/react-components';

import React from 'react';
import {Card} from './model/Card.ts';

import './Dictionary.css'
import {LanguageInfo} from './model/LanguageInfo.ts';

type DictionaryTableProps = {
  cards: Card[]
  currentLanguage: LanguageInfo
}

export const Dictionary: React.FunctionComponent<DictionaryTableProps> = ({cards, currentLanguage }) => {
  return (
    <Table arial-label="Default table">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>English</TableHeaderCell>
          <TableHeaderCell>{currentLanguage.fullName}</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card.en}>
            <TableCell>{card.en}</TableCell>
            <TableCell className='hebrewFont'>{card.word}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};