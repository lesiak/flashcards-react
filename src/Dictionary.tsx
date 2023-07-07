import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
} from "@fluentui/react-components";

import React from "react";
import {Card} from "./model/Card.ts";

import './Dictionary.css'

const columns = [
  {columnKey: "en", label: "English"},
  {columnKey: "he", label: "Hebrew"},
];

type DictionaryTableProps = {
  cards: Card[]
}

export const Dictionary: React.FunctionComponent<DictionaryTableProps> = ({cards}) => {
  return (
    <Table arial-label="Default table">
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell key={column.columnKey}>
              {column.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card.en}>
            <TableCell>{card.en}</TableCell>
            <TableCell className='hebrewFont'>{card.he}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};