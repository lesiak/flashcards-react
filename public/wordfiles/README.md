# Deck files

One JSON file per deck per language: `public/wordfiles/<lang>/<course>/<Deck>.json`.
Decks are organised in courses, each a folder under the language: `words`
holds the thematic vocabulary decks, `a1` the A1 course. The app asks for a
course first and remembers the choice. Inside a course, `Lessons.json`
arranges the decks in sections; a course with a single section shows its
decks directly. A language that has no file for a listed deck simply skips
it, and a section or course with no decks for a language is not shown.

```json
{
  "courses": [
    { "id": "words", "name": "Vocabulary", "sections": [
      { "name": "Basics", "decks": ["Nature", "Landscape", "Weather"] },
      { "name": "People", "decks": ["Family", "Relationships"] }
    ] },
    { "id": "a1", "name": "A1 Level", "sections": [
      { "name": "A1 Level", "decks": ["A1_Level_Part1", "A1_Level_Part2"] }
    ] }
  ]
}
```

A course that makes sense for only some languages lists them in `languages`,
e.g. the Chinese `hanzi` course of characters ordered from the easiest to
write. Other languages never load it, and `decks:check` fails if a language
not listed has a folder of decks for it. A course without `languages` is open
to every language that has decks for it.

```json
{ "id": "hanzi", "name": "Characters", "languages": ["zh"], "sections": [
  { "name": "Characters", "decks": ["OneTwoStrokes", "ThreeStrokes"] }
] }
```

Sections live only in `Lessons.json`. The files stay in the course folder
and the audio is stored and keyed per course folder, so moving a deck to
another section, reordering decks or moving a word between decks of one
course never touches a recording. Only moving a deck to another course
means voicing it again.

Deck names carry no numbers; `Lessons.json` alone decides the order, so a
deck can be moved or inserted without renaming files in every language. A
`words` deck holds at most 100 cards, ideally around 50; 20 is fine too.

Spanish is the reference for the `words` course: every language has the
same deck files with the same `en` cards in the same order, and a card the
language has no translation for yet has `"word": ""`. The app hides such a
card, and a deck with no translated card at all, so a language can be
filled in deck by deck. A language may add cards Spanish lacks (Hebrew
gendered numbers, Turkish paternal/maternal relatives); they go at the end
of the deck.
`toDrop.json` is the one deck allowed on disk without an entry here: it
collects cards waiting to be sorted into a theme or removed, and the app
never shows it.

## Checks

`npm run decks:check` validates every deck file and `Lessons.json` against
the rules on this page (structure, listed decks, duplicate `en`, deck size,
bracket and `|` marks, clip-name collisions) and fails the build on the
first error, so run it before committing deck changes. A card with an empty
`word` is only a warning: it marks a translation still to be written.

A deck file:

```json
{
  "name": "City",
  "description": "City",
  "image": "https://images.unsplash.com/photo-...",
  "cards": [
    { "en": "bridge",            "word": "(le) pont" },
    { "en": "building",          "word": "(le) bâtiment | (l')immeuble" },
    { "en": "Do you want this?", "word": "Tu veux ça ? | Veux-tu ça ?",
      "note": "A rising tone on the statement is how people ask in speech." }
  ]
}
```

## Fields

- `en` is the prompt. British English for sentences.
- `word` is the answer in the target language. It is displayed as written and
  is also what gets voiced, following the marks below.
- `romanization` is optional: how a word in a non-Latin script reads in Latin
  letters, pinyin with tone marks for Chinese, a simple transliteration for
  Hebrew (`kh` for ח and כ, `'` between vowels or after a glottal stop). It
  has one part per `|` alternative of `word`, in the same order, and no
  brackets; the app shows each part under its alternative, in a smaller,
  lighter font, and never voices it. Keep the reading out of `word`: square
  brackets are for glosses such as `[informal]`.

  ```json
  { "en": "two", "word": "二 | 两", "romanization": "èr | liǎng" }
  ```
- `note` is optional: a short usage remark shown under the answer once it is
  revealed, never voiced. Use it for nuances such as ser vs estar or a
  register difference. Add one only when a learner would otherwise be puzzled.

## Marks inside `word`

| Mark | Meaning | Example | Voiced as |
|---|---|---|---|
| `\|` | separates alternatives, each voiced as its own clip | `(la) cara \| (el) rostro` | `la cara`, `el rostro` |
| `( )` | spoken, shown as optional or grammatical | `(le) pain`, `središte (grada)`, `casarse (con)` | `le pain`, `središte grada`, `casarse con` |
| `( / )` | either of two, so the word is voiced without it | `(el/la) artista` | `artista` |
| `[ ]` | silent note for the reader, never spoken | `mennä poikki [e.g. a room]`, `kusura bakma [informal]` | `mennä poikki`, `kusura bakma` |

A comma is ordinary punctuation. `Oui, je veux ça.` is one clip. Only the
pipe splits.

Rules of thumb:

- Articles go in round brackets: `(le)`, `(la)`, `(l')`, `(el)`, `(de)`, `(het)`.
  Write the elided form as `(l')eau` so the voice says it without a gap.
- Put the most idiomatic spoken form first; the app autoplays the first clip.
- A gloss of two or three words goes in square brackets next to the word.
  Anything longer goes in `note`.
- Sentences keep their punctuation, including `¿ ?` and the French space
  before `?`. A question mark or an exclamation mark changes how the clip is
  spoken, so it also tells the clips apart (`como` and `como?` are two clips);
  other punctuation never reaches a file name.

## Audio

`npm run audio -- public/wordfiles/<lang>/<group>/<Deck>.json` voices every
clip that is not yet in `audio-cache/<lang>/<group>/manifest.json`. The
manifest is keyed by the voiced text, so changing a card's marks or
separators never orphans its recordings, and two cards that share an
alternative share one clip. Clips are stored under `<lang>/<group>/<voiceId>/`,
so each group has its own audio and the same word in two groups is voiced
once per group. The file name is derived
from the voiced text: whitespace becomes `_`, `?` becomes `_q`, `!` becomes
`_excl`, and the remaining sentence punctuation and unsafe characters are
dropped, so `¿Quieres esto?` is stored as `Quieres_esto_q.mp3` and
`natuurlijk!` as `natuurlijk_excl.mp3`. Two texts that would still share a
file name (say, differing only by a comma) collide; `decks:check` reports
it and the audio script refuses to run.
