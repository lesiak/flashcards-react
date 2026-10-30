export interface Card {
    en: string;
    word: string;
    /**
     * Optional reading of a word in a non-Latin script, e.g. pinyin for Chinese.
     * One part per "|" alternative of `word`, in the same order. Shown under
     * the word, never voiced.
     */
    romanization?: string;
    /** Optional usage remark shown with the answer, e.g. a ser/estar nuance. Not voiced. */
    note?: string;
}
