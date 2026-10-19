# Deck files

One JSON file per deck per language: `public/wordfiles/<lang>/<group>/<Deck>.json`.
Decks are organised in groups, each a folder under the language and a heading
in the app: `words` holds the thematic vocabulary decks, `a1` the A1 course.
`Lessons.json` lists the groups and the deck names in each; a language that
has no file for a listed deck simply skips it, and a group with no decks for
a language is not shown.

```json
{
  "groups": [
    { "id": "words", "name": "Vocabulary", "decks": ["Nature", "Landscape", "Weather"] },
    { "id": "a1",    "name": "A1 Level",   "decks": ["A1_Level_Part1", "A1_Level_Part2"] }
  ]
}
```

Deck names carry no numbers; `Lessons.json` alone decides the order, so a
deck can be moved or inserted without renaming files in every language. A
`words` deck holds at most 100 cards, ideally around 50; 20 is fine too.
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
  before `?`. Punctuation never reaches a file name.

## Audio

`npm run audio -- public/wordfiles/<lang>/<group>/<Deck>.json` voices every
clip that is not yet in `audio-cache/<lang>/<group>/manifest.json`. The
manifest is keyed by the voiced text, so changing a card's marks or
separators never orphans its recordings, and two cards that share an
alternative share one clip. Clips are stored under `<lang>/<group>/<voiceId>/`,
so each group has its own audio and the same word in two groups is voiced
once per group. The file name is derived
from the voiced text: whitespace becomes `_`, unsafe characters and sentence
punctuation are dropped, so `¿Quieres esto?` is stored as `Quieres_esto.mp3`.
Two alternatives that differ only by punctuation would collide; the script
refuses to run if that happens.
