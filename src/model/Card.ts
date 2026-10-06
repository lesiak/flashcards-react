export interface Card {
    en: string;
    word: string;
    /** Optional usage remark shown with the answer, e.g. a ser/estar nuance. Not voiced. */
    note?: string;
}