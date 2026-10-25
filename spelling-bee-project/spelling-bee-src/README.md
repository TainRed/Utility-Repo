# Spelling Bee

Mobile-first spelling and vocabulary app (English, French, Spanish). React + Vite.
Words live in JSON files, so adding words or categories never needs code changes.

## Run it
```bash
npm install
npm run dev        # local development server
npm run build      # validates the word files, then builds to dist/
npm run preview    # serve the built app locally
```

## Word files
`src/data/en.json`, `fr.json`, `es.json`. One object per word:

```json
{
  "id": "fr-0001",
  "lang": "fr",
  "category": "general",
  "article": "la",
  "gender": "f",
  "word": "maison",
  "translation": "house",
  "sentence": "Ils habitent dans une grande ~ blanche.",
  "sentenceTranslation": "They live in a big white ~."
}
```
- `~` marks where the word goes. English entries only need `id`, `lang`, `category`, `word`, `sentence`.
- `article` is `le`, `la` or `l'` (French), `el` or `la` (Spanish). `gender` is `m`, `f` or `mf`.
- `npm run validate` checks every file (missing fields, duplicates, sentences that leak the word, article/gender mismatches). The build stops if anything fails.
- `category` is stored but not used yet. Category practice is the next feature.

## Put it on GitHub Pages (inside the toolkit repo)
1. Run `npm run build`.
2. Copy everything inside `dist/` into a folder called `spelling-bee/` at the root of the Utility-Repo repo.
3. Commit and push. It will be live at `https://tainred.github.io/Utility-Repo/spelling-bee/`.
4. Add a card on the hub page that links to `spelling-bee/`.

The app is built with relative paths (`base: './'`), so it works from any sub-folder.
It must be opened over http(s). Opening `index.html` straight from a file manager will not work.

Do not use a "deploy to Pages" GitHub Action in the toolkit repo. It would replace the whole site with only this app.

## Saved data
Stored in the browser's localStorage under keys starting `bee-` (language, voice, mute, word history).

## Not built yet
Category dropdown, round summary, export/import save code, teacher word lists, credits page.
See SPELLING-BEE.md for the plan.
