import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import { phraseOf } from '../lib/text.js';

export const DATA = { en, fr, es };
export const LANGS = { en: 'English', fr: 'Français', es: 'Español' };
export const FILTERS = [['Any', 0, 99], ['≤4', 0, 4], ['5', 5, 5], ['6', 6, 6], ['7', 7, 7], ['8', 8, 8], ['9', 9, 9], ['10+', 10, 99]];

// Look an entry up by language + the phrase shown in the stats table (article + word).
export const INDEX = Object.fromEntries(
  Object.entries(DATA).map(([k, list]) => [k, Object.fromEntries(list.map((e) => [phraseOf(e), e]))]),
);
