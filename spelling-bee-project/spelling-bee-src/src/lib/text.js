export const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const phraseOf = (e) =>
  (e.article ? (e.article.endsWith("'") ? e.article : e.article + ' ') : '') + e.word;

// Everything the game needs to know about one entry.
export function buildInfo(e) {
  const art = (e.article || '').replace(/'/g, '');
  const target = [...(art + e.word)];
  return { art, artLen: art.length, target, norm: target.map(strip), phrase: phraseOf(e) };
}

// Next slot a hint can go in: skips letters already typed correctly or already revealed.
export const nextHint = (typed, hints, norm) => {
  const t = [...typed.toLowerCase()];
  for (let i = 0; i < norm.length; i++) {
    if (hints.includes(i)) continue;
    if (t[i] && strip(t[i]) === norm[i]) continue;
    return i;
  }
  return -1;
};

export const GENDER = { m: 'Masculine', f: 'Feminine', mf: 'Masculine or feminine' };
export const ACCENT_NAMES = {
  á: 'acute', é: 'acute', í: 'acute', ó: 'acute', ú: 'acute',
  à: 'grave', è: 'grave', ù: 'grave',
  â: 'circumflex', ê: 'circumflex', î: 'circumflex', ô: 'circumflex', û: 'circumflex',
  ë: 'diaeresis', ï: 'diaeresis', ü: 'diaeresis', ç: 'cedilla', ñ: 'tilde',
};
