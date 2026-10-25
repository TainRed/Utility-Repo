export const VOICE_LANG = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };
const norm = (l) => l.replace('_', '-');

// Voices installed on this device for a language, best match first.
export function listVoices(lang) {
  if (!('speechSynthesis' in window)) return [];
  const code = VOICE_LANG[lang];
  return speechSynthesis.getVoices()
    .filter((v) => v.lang.slice(0, 2) === code.slice(0, 2))
    .sort((a, b) => (norm(b.lang) === code) - (norm(a.lang) === code) || a.name.localeCompare(b.name));
}

export function say(text, lang, voiceURI) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const code = VOICE_LANG[lang] || 'en-GB';
  const vs = speechSynthesis.getVoices();
  u.lang = code; u.rate = 0.85;
  const vo = (voiceURI && vs.find((v) => v.voiceURI === voiceURI))
    || vs.find((v) => norm(v.lang) === code)
    || vs.find((v) => v.lang.slice(0, 2) === code.slice(0, 2));
  if (vo) u.voice = vo;
  speechSynthesis.speak(u);
  return true;
}
