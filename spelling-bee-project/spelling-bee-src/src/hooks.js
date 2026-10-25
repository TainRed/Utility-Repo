import { useCallback, useEffect, useRef, useState } from 'react';
import { listVoices } from './lib/speech.js';

// useState that is saved in localStorage (works with the keys the single-file version used).
export function useLocal(key, init) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return init;
      try { return JSON.parse(raw); } catch { return raw; }
    } catch { return init; }
  });
  const set = useCallback((x) => setV((p) => {
    const n = typeof x === 'function' ? x(p) : x;
    try {
      localStorage.setItem(key, typeof n === 'string' ? n : typeof n === 'boolean' ? (n ? '1' : '0') : JSON.stringify(n));
    } catch { /* ignore */ }
    return n;
  }), [key]);
  return [v, set];
}

// useState plus a ref that is always up to date (for event listeners and timers).
export function useSync(init) {
  const [v, setV] = useState(init);
  const ref = useRef(init);
  const set = useCallback((x) => { ref.current = x; setV(x); }, []);
  return [v, set, ref];
}

export function useVoices(lang) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const up = () => setList(listVoices(lang));
    up();
    speechSynthesis.addEventListener('voiceschanged', up);
    return () => speechSynthesis.removeEventListener('voiceschanged', up);
  }, [lang]);
  return list;
}
