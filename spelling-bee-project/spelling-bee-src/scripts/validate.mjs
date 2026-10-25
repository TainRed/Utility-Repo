// Checks every word file before a build. Run with: npm run validate
import { readFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/data/', import.meta.url);
const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const ARTICLES = { en: [''], fr: ['le', 'la', "l'"], es: ['el', 'la'] };
const problems = [];
const ids = new Set();

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const list = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const seen = new Set();
  for (const e of list) {
    const at = `${file} ${e.id || e.word}`;
    const bad = (m) => problems.push(`${at}: ${m}`);
    for (const k of ['id', 'lang', 'category', 'word', 'sentence']) if (!e[k]) bad(`missing ${k}`);
    if (ids.has(e.id)) bad('duplicate id'); ids.add(e.id);
    if (e.lang !== file.replace('.json', '')) bad('lang does not match file name');
    const key = `${e.article || ''}|${e.word}`;
    if (seen.has(key)) bad('duplicate word'); seen.add(key);
    if ((e.sentence.match(/~/g) || []).length !== 1) bad('sentence needs exactly one ~');
    const stem = strip(e.word).slice(0, Math.max(3, e.word.length - 3));
    if (strip(e.sentence.replace('~', '')).includes(stem)) bad('sentence leaks the word');
    if (e.lang !== 'en') {
      if (!ARTICLES[e.lang].includes(e.article)) bad(`article "${e.article}" not allowed`);
      if (!['m', 'f', 'mf'].includes(e.gender)) bad('gender must be m, f or mf');
      if (!e.translation) bad('missing translation');
      if (!e.sentenceTranslation || (e.sentenceTranslation.match(/~/g) || []).length !== 1) bad('sentenceTranslation needs exactly one ~');
      if (e.article === 'le' || e.article === 'el') { if (e.gender !== 'm') bad('article/gender mismatch'); }
      if (e.article === 'la' && e.gender !== 'f') bad('article/gender mismatch');
    }
  }
  console.log(`${file}: ${list.length} entries`);
}
if (problems.length) { console.error('\n' + problems.join('\n')); process.exit(1); }
console.log('Word files OK');
