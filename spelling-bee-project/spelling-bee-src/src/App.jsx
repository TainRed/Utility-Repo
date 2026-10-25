import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DATA, LANGS, FILTERS } from './data/index.js';
import { strip, shuffle, buildInfo, nextHint, ACCENT_NAMES } from './lib/text.js';
import { sfx, buzz, wake, setMuted } from './lib/audio.js';
import { say } from './lib/speech.js';
import { useLocal, useSync, useVoices } from './hooks.js';
import Icon from './Icon.jsx';
import Stats from './Stats.jsx';

const inRange = (e, [lo, hi]) => { const n = [...e.word].length; return n >= lo && n <= hi; };

export default function App() {
  const [savedLang, setLang] = useLocal('bee-lang', 'en');
  const lang = DATA[savedLang] ? savedLang : 'en';
  const [range, setRange] = useState([0, 99]);
  const [cur, setCur] = useState(null);
  const [typed, setTyped, typedRef] = useSync('');
  const [hints, setHints, hintsRef] = useSync([]);
  const [locked, setLocked, lockedRef] = useSync(false);
  const [result, setResult] = useState('');
  const [msg, setMsg] = useState({ t: '', k: '' });
  const [shake, setShake] = useState(0);
  const [fresh, setFresh] = useState({ i: -1, n: 0 });
  const [transOn, setTransOn] = useState(false);
  const [autoOn, setAutoOn] = useState(false);
  const [frac, setFrac] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [muted, setMutedState] = useLocal('bee-mute', false);
  const [hist, setHist] = useLocal('bee-hist', []);
  const [voices, setVoices] = useLocal('bee-voices', {});
  const voiceList = useVoices(lang);

  const info = useMemo(() => (cur ? buildInfo(cur) : null), [cur]);
  const inputRef = useRef(null);
  const pool = useRef([]);
  const cnt = useRef({ typed: 0, err: 0, first: 0, start: 0, limit: 30 });
  const nextTimer = useRef(0);
  const api = useRef({});
  const live = useRef({});
  live.current = { lang, range, info, cur, voices };
  const histList = Array.isArray(hist) ? hist : [];

  const fracNow = () => Math.max(0, 1 - (Date.now() - cnt.current.start) / 1000 / cnt.current.limit);
  const speak = (text, l = lang) => {
    wake();
    if (!say(text, l, voices[l])) setMsg({ t: 'Speech is not supported on this device.', k: 'bad' });
  };

  /* ---------- word flow ---------- */
  const nextWord = useCallback((doSpeak) => {
    clearTimeout(nextTimer.current);
    const { lang: l, range: r, voices: v } = live.current;
    if (!pool.current.length) pool.current = shuffle(DATA[l].filter((e) => inRange(e, r)));
    if (!pool.current.length) pool.current = shuffle(DATA[l]);
    const e = pool.current.pop();
    const inf = buildInfo(e);
    cnt.current = { typed: 0, err: 0, first: 0, start: Date.now(), limit: 10 + 3 * inf.target.length };
    setCur(e); setTyped(''); setHints([]); setLocked(false); setResult('');
    setMsg({ t: '', k: '' }); setFrac(1); setShake(0);
    if (inputRef.current) inputRef.current.value = '';
    if (doSpeak) setTimeout(() => say(inf.phrase, l, v[l]), 250);
  }, [setCur, setTyped, setHints, setLocked]);

  useEffect(() => { pool.current = []; nextWord(false); }, [lang, range, nextWord]);
  useEffect(() => () => clearTimeout(nextTimer.current), []);
  useEffect(() => { setMuted(!!muted); }, [muted]);
  useEffect(() => {
    const w = () => wake();
    document.addEventListener('pointerdown', w, { once: true });
    return () => document.removeEventListener('pointerdown', w);
  }, []);

  // countdown
  useEffect(() => {
    if (!cur || locked) return undefined;
    const id = setInterval(() => setFrac(fracNow()), 250);
    return () => clearInterval(id);
  }, [cur, locked]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto reveal
  useEffect(() => {
    if (!autoOn || locked || !cur) return undefined;
    const id = setInterval(() => api.current.reveal(), 750);
    return () => clearInterval(id);
  }, [autoOn, locked, cur]);

  /* ---------- recording ---------- */
  function record(res, pts) {
    const e = live.current.cur, inf = live.current.info, c = cnt.current;
    const secs = c.first ? Math.max(0.5, (Date.now() - c.first) / 1000) : 0;
    const wpm = res === 'correct' && secs ? Math.round((inf.target.length / 5) / (secs / 60)) : null;
    const acc = c.typed ? Math.round(((c.typed - c.err) / c.typed) * 100) : null;
    setHist((h) => [...(Array.isArray(h) ? h : []), {
      l: live.current.lang, w: inf.phrase, t: e.translation || '', r: res, p: pts,
      k: c.typed, e: c.err, a: acc, s: +secs.toFixed(1), wpm, h: hintsRef.current.length,
    }].slice(-300));
  }

  function finish() {
    if (lockedRef.current) return;
    const n = live.current.info.target.length;
    setLocked(true); setAutoOn(false);
    const f = fracNow(), base = Math.max(1, n - hintsRef.current.length), bonus = Math.round(n * f), pts = base + bonus;
    setFrac(f); setScore((s) => s + pts); setStreak((s) => s + 1);
    record('correct', pts); setResult('correct');
    sfx.ok(); buzz([20, 40, 20]);
    setMsg({ t: `Correct! +${pts} (${base} + ${bonus} speed bonus)`, k: 'ok' });
    nextTimer.current = setTimeout(() => nextWord(true), 3200);
  }

  function skip() {
    if (lockedRef.current) return;
    const inf = live.current.info;
    setLocked(true); setAutoOn(false); setStreak(0);
    typedRef.current = inf.target.join(''); setTyped(typedRef.current);
    if (inputRef.current) inputRef.current.value = typedRef.current;
    record('skipped', 0); setResult('skipped');
    sfx.skip(); setMsg({ t: 'Here is the answer', k: 'bad' });
    nextTimer.current = setTimeout(() => nextWord(true), 3400);
  }

  function check() {
    if (lockedRef.current) return;
    const raw = typedRef.current;
    if (!raw) { setMsg({ t: 'Type your spelling first.', k: 'bad' }); return; }
    if (strip(raw) === live.current.info.norm.join('')) { finish(); return; }
    setStreak(0); setShake((n) => n + 1); sfx.bad(); buzz(120);
    setMsg({ t: 'Not quite. Listen again or reveal a letter.', k: 'bad' });
  }

  /* ---------- typing: letters are always appended at the end ---------- */
  function commit(v) {
    const a = inputRef.current;
    if (lockedRef.current) { if (a) a.value = typedRef.current; return; }
    const { norm, target } = live.current.info;
    v = v.normalize('NFC').replace(/[^\p{L}]/gu, '').slice(0, target.length);
    if (a) { a.value = v; try { a.setSelectionRange(v.length, v.length); } catch { /* ignore */ } }
    const prev = typedRef.current, grew = v.length > prev.length;
    typedRef.current = v; setTyped(v);
    if (grew) {
      const c = cnt.current;
      if (!c.first) c.first = Date.now();
      let bad = 0, near = 0;
      for (let k = prev.length; k < v.length; k++) {
        const ch = strip(v[k]);
        c.typed++;
        if (ch !== norm[k]) { c.err++; if (norm.includes(ch)) near++; else bad++; }
      }
      if (bad) sfx.wrongKey(); else if (near) sfx.near(); else sfx.tap();
    } else sfx.tap();
    setMsg({ t: '', k: '' });
    if (v && strip(v) === norm.join('')) finish();
  }

  function reveal() {
    if (lockedRef.current) return;
    const { norm } = live.current.info;
    const i = nextHint(typedRef.current, hintsRef.current, norm);
    if (i < 0) { setAutoOn(false); return; }
    const t = [...typedRef.current];
    if (t[i] && strip(t[i]) !== norm[i]) commit(typedRef.current.slice(0, i));
    const nh = [...hintsRef.current, i];
    setHints(nh);
    setFresh((f) => ({ i, n: f.n + 1 }));
    sfx.tick(nh.length); buzz(8);
    if (nextHint(typedRef.current, nh, norm) < 0) setAutoOn(false);
  }

  api.current = { commit, check, reveal };

  useEffect(() => {
    const a = inputRef.current;
    const bi = (e) => {
      if (e.inputType === 'insertText' && e.data) { e.preventDefault(); api.current.commit(typedRef.current + e.data); }
      else if (e.inputType === 'deleteContentBackward') { e.preventDefault(); api.current.commit(typedRef.current.slice(0, -1)); }
    };
    const inp = (e) => {
      let v = a.value;
      const p = typedRef.current;
      if (e.inputType === 'insertText' && e.data && v.length > p.length) v = p + e.data;
      else if (e.inputType === 'deleteContentBackward' && v.length < p.length) v = p.slice(0, -1);
      api.current.commit(v);
    };
    const foc = () => { const l = a.value.length; try { a.setSelectionRange(l, l); } catch { /* ignore */ } };
    const key = (e) => { if (e.key === 'Enter') { e.preventDefault(); api.current.check(); } };
    a.addEventListener('beforeinput', bi); a.addEventListener('input', inp);
    a.addEventListener('focus', foc); a.addEventListener('keydown', key);
    return () => {
      a.removeEventListener('beforeinput', bi); a.removeEventListener('input', inp);
      a.removeEventListener('focus', foc); a.removeEventListener('keydown', key);
    };
  }, [typedRef]);

  /* ---------- render helpers ---------- */
  const chips = useMemo(() => FILTERS
    .map(([label, lo, hi], i) => ({ label, lo, hi, n: DATA[lang].filter((e) => inRange(e, [lo, hi])).length, i }))
    .filter((c) => c.n || !c.i), [lang]);

  let slotsView = null, answerView = null;
  if (info && cur) {
    const tArr = [...typed.toLowerCase()], left = {};
    info.norm.forEach((ch, i) => { if (strip(tArr[i] || '') !== ch) left[ch] = (left[ch] || 0) + 1; });
    const st = tArr.map((t, i) => {
      const n = strip(t);
      if (n === info.norm[i]) return 'right';
      if (left[n] > 0) { left[n]--; return 'near'; }
      return 'wrong';
    });
    const nh = nextHint(typed, hints, info.norm);
    const slot = (i) => {
      const t = tArr[i], isHint = hints.includes(i);
      const cls = ['slot', st[i], t && 'typed', isHint && !t && 'hint', !locked && i === nh && !t && 'next'].filter(Boolean).join(' ');
      return (
        <div className={cls} key={i}>
          <span key={fresh.i === i ? fresh.n : 0} className={fresh.i === i ? 'fresh' : ''}>{t || (isHint ? info.norm[i] : '')}</span>
        </div>
      );
    };
    const wordIdx = Array.from({ length: info.target.length - info.artLen }, (_, k) => info.artLen + k);
    slotsView = (
      <div className={`slots${shake ? ' bad' : ''}`} key={`s${shake}`} style={{ '--n': info.target.length + (info.artLen ? 2 : 0) }}
        onClick={() => inputRef.current && inputRef.current.focus()}>
        {info.artLen > 0 && <>
          <div className="grp">
            {Array.from({ length: info.artLen }, (_, i) => slot(i))}
            {cur.article.endsWith("'") && <i className="apos">'</i>}
          </div>
          <Icon n="arrow" className="sep" />
        </>}
        <div className="grp">{wordIdx.map(slot)}</div>
      </div>
    );
    if (locked) {
      const miss = result === 'correct'
        ? [...new Set(info.target.filter((ch, i) => strip(ch) !== ch && tArr[i] !== ch))] : [];
      answerView = (
        <div className="answer">
          <div className="aw">{[...info.phrase].map((ch, i) => (strip(ch) !== ch ? <span key={i} className="acc">{ch}</span> : ch))}</div>
          <div className="note">{miss.length ? `Don't forget the accent${miss.length > 1 ? 's' : ''}: ` + miss.map((c) => `${c} (${ACCENT_NAMES[c] || 'accent'})`).join(', ') : ''}</div>
        </div>
      );
    }
  }

  const secsLeft = Math.ceil(cnt.current.limit * frac);
  const nHint = info ? nextHint(typed, hints, info.norm) : -1;
  const hasTr = !!(cur && cur.translation);

  return (
    <div className="app">
      <header>
        <div className="brand">Spelling<em>Bee</em></div>
        <div className="hdr">
          <div className="pill"><b>{score}</b><span>Points</span></div>
          <div className="pill"><b>{streak}</b><span>Streak</span></div>
          <button className="sq" aria-label="Toggle sound" onClick={() => { const m = !muted; setMutedState(m); setMuted(m); if (!m) sfx.pick(); }}>
            <Icon n={muted ? 'mute' : 'vol'} />
          </button>
        </div>
      </header>

      <div className="seg" role="group" aria-label="Language">
        {Object.entries(LANGS).map(([k, name]) => (
          <button key={k} aria-pressed={k === lang} onClick={() => { setLang(k); setRange([0, 99]); sfx.pick(); }}>{name}</button>
        ))}
      </div>

      <label className="voice">Voice
        <select value={voices[lang] || ''} disabled={!voiceList.length} aria-label="Voice"
          onChange={(e) => {
            const uri = e.target.value;
            setVoices({ ...voices, [lang]: uri });
            if (info) say(info.phrase, lang, uri);
          }}>
          <option value="">{voiceList.length ? 'Default voice' : 'No extra voices on this device'}</option>
          {voiceList.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
        </select>
      </label>

      <div className="chips" role="group" aria-label="Word length">
        {chips.map((c) => (
          <button key={c.label} className="chip" aria-pressed={range[0] === c.lo && range[1] === c.hi}
            onClick={() => { setRange([c.lo, c.hi]); sfx.pick(); }}>{c.label}</button>
        ))}
      </div>

      <main className="card">
        <div className="topline">
          <div className="meta">{info ? `${info.artLen ? info.artLen + ' + ' : ''}${[...cur.word].length} letters · ${pool.current.length} left` : ''}</div>
          <div className={`timer${frac < 0.34 ? ' low' : ''}`}>
            <span>{secsLeft}s</span>
            <div className="bar"><i style={{ transform: `scaleX(${frac})` }} /></div>
          </div>
        </div>

        <button className="play" aria-label="Hear the word" onClick={() => info && speak(info.phrase)}><Icon n="vol" /></button>

        <div className="clue-row">
          <div className="clue">{cur ? cur.sentence.replace('~', '_____') : ''}</div>
          {hasTr && <button className="sq sm" id="tr" aria-pressed={transOn} aria-label="Show English translation" onClick={() => { setTransOn(!transOn); sfx.pick(); }}>EN</button>}
          <button className="sq sm" aria-label="Read the clue aloud" onClick={() => cur && speak(cur.sentence.replace('~', cur.word))}><Icon n="vol" /></button>
        </div>

        {hasTr && (transOn || locked) && (
          <div className="trans">
            <div><b>{cur.translation}</b> · {cur.sentenceTranslation.replace('~', locked ? cur.translation : '_____')}</div>
            <button className="sq sm" aria-label="Read the English sentence aloud"
              onClick={() => speak(cur.sentenceTranslation.replace('~', cur.translation), 'en')}><Icon n="vol" /></button>
          </div>
        )}

        <div>
          {slotsView}
          <input id="ans" ref={inputRef} dir="ltr" style={{ direction: 'ltr' }} lang={lang} autoComplete="off" autoCapitalize="none"
            autoCorrect="off" spellCheck="false" enterKeyHint="done" aria-label="Type the word" />
        </div>

        {answerView}
        <div className={`msg ${msg.k}`}>{msg.t}</div>

        <div className="tools">
          <button className="tool" disabled={locked || nHint < 0} onClick={reveal}><Icon n="eye" />Reveal</button>
          <button className="tool" aria-pressed={autoOn} onClick={() => { setAutoOn(!autoOn); sfx.pick(); }}><Icon n="zap" />Auto reveal</button>
          <button className="tool" onClick={skip}><Icon n="skip" />Skip</button>
        </div>
        <div className="go">
          <button className="sq" aria-label="Delete letter" onClick={() => { if (!lockedRef.current) { commit(typedRef.current.slice(0, -1)); inputRef.current && inputRef.current.focus(); } }}><Icon n="del" /></button>
          <button className="check" onClick={check}><Icon n="check" />Check</button>
        </div>
      </main>

      <Stats hist={histList} setHist={setHist} speak={speak} />
    </div>
  );
}
