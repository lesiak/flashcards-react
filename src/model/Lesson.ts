import {Card} from './Card.ts';

export interface Lesson {
  name: string;
  description: string;
  image?: string;
  cards: Card[];
}