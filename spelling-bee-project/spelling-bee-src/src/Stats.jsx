import { useMemo, useState } from 'react';
import { INDEX } from './data/index.js';
import { GENDER } from './lib/text.js';
import Icon from './Icon.jsx';

const TABS = [['all', 'Mixed'], ['en', 'English'], ['fr', 'Français'], ['es', 'Español']];

function Chart({ data }) {
  const d = data.filter((h) => h.wpm != null).slice(-20);
  if (!d.length) return <p className="empty">Spell a word to see your speed here.</p>;
  const W = 320, H = 130, pl = 26, pb = 14, pt = 8, ch = H - pb - pt;
  const max = Math.max(10, ...d.map((h) => h.wpm)), bw = (W - pl - 6) / d.length;
  const avg = d.reduce((a, h) => a + h.wpm, 0) / d.length, ay = pt + ch - (avg / max) * ch;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Words per minute for each recent word">
      <line x1={pl} x2={W - 4} y1={pt + ch} y2={pt + ch} className="ax" />
      <text x="0" y={pt + 8} className="tx">{max}</text>
      <text x="0" y={pt + ch} className="tx">0</text>
      {d.map((h, i) => {
        const bh = Math.max(2, (h.wpm / max) * ch);
        const cl = !h.e ? 'b-ok' : h.a >= 70 ? 'b-near' : 'b-bad';
        return (
          <rect key={i} x={pl + i * bw + bw * 0.15} y={pt + ch - bh} width={bw * 0.7} height={bh} rx="3" className={cl}>
            <title>{`${h.w}: ${h.wpm} WPM, ${h.a}% accurate`}</title>
          </rect>
        );
      })}
      <line x1={pl} x2={W - 4} y1={ay} y2={ay} className="avg" />
      <text x={W - 4} y={ay - 3} textAnchor="end" className="tx">{`avg ${Math.round(avg)}`}</text>
    </svg>
  );
}

function Detail({ h, speak }) {
  const e = INDEX[h.l] && INDEX[h.l][h.w];
  if (!e) return <p className="empty">No extra details saved for this word.</p>;
  const sentence = e.sentence.replace('~', e.word);
  const trSentence = e.sentenceTranslation ? e.sentenceTranslation.replace('~', e.translation) : '';
  const apos = e.article === "l'";
  const rule = apos
    ? "l' replaces le/la before a vowel sound, so the article does not show the gender."
    : e.article ? `${e.article} is the ${e.gender === 'm' ? 'masculine' : 'feminine'} article.` : '';
  return (
    <div className="detail">
      <div className="dline">
        <b>{h.w}</b>
        <button className="sq sm" aria-label="Hear the word" onClick={(ev) => { ev.stopPropagation(); speak(h.w, h.l); }}><Icon n="vol" /></button>
      </div>
      {e.translation && <p className="dsub">{e.translation}</p>}
      {e.gender && (
        <p><span className={`gbadge ${e.gender}`}>{GENDER[e.gender]}</span><span className="gnote">{rule}</span></p>
      )}
      <div className="sline">
        <p>{sentence}</p>
        <button className="sq sm" aria-label="Hear the sentence" onClick={(ev) => { ev.stopPropagation(); speak(sentence, h.l); }}><Icon n="vol" /></button>
      </div>
      {trSentence && (
        <div className="sline">
          <p className="dsub">{trSentence}</p>
          <button className="sq sm" aria-label="Hear the English sentence" onClick={(ev) => { ev.stopPropagation(); speak(trSentence, 'en'); }}><Icon n="vol" /></button>
        </div>
      )}
    </div>
  );
}

export default function Stats({ hist, setHist, speak }) {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);

  const list = useMemo(() => (tab === 'all' ? hist : hist.filter((h) => h.l === tab)), [hist, tab]);
  const ok = list.filter((h) => h.r === 'correct');
  const K = list.reduce((a, h) => a + h.k, 0), E = list.reduce((a, h) => a + h.e, 0);
  const wp = ok.filter((h) => h.wpm != null);
  const rows = [...list].reverse();
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const pg = Math.min(page, pages - 1);

  return (
    <section className="stats" aria-label="Your stats">
      <h2>Your stats</h2>
      <div className="seg" role="group" aria-label="Show stats for">
        {TABS.map(([k, n]) => (
          <button key={k} aria-pressed={tab === k} onClick={() => { setTab(k); setPage(0); setOpen(null); }}>{n}</button>
        ))}
      </div>
      <div className="sgrid">
        <div className="pill"><b>{ok.length}</b><span>Words</span></div>
        <div className="pill"><b>{K ? Math.round(((K - E) / K) * 100) + '%' : '–'}</b><span>Accuracy</span></div>
        <div className="pill"><b>{wp.length ? Math.round(wp.reduce((a, h) => a + h.wpm, 0) / wp.length) : '–'}</b><span>Avg WPM</span></div>
      </div>

      <div className="panel">
        <h3>Speed per word (WPM)</h3>
        <div id="chart"><Chart data={list} /></div>
        <p className="legend">Last 20 words. Green: no errors. Orange: some errors. Red: accuracy under 70%. Dashed line: average. WPM = letters ÷ 5 per minute, timed from your first key to your last.</p>
      </div>

      <div className="panel">
        <h3>Words spelled</h3>
        <table>
          <thead><tr><th>Word</th><th>Accuracy</th><th>WPM</th><th>Pts</th></tr></thead>
          <tbody>
            {rows.slice(pg * 10, pg * 10 + 10).map((h) => {
              const id = hist.indexOf(h), isOpen = open === id;
              const toggle = () => setOpen(isOpen ? null : id);
              return [
                <tr key={id} className={`row${isOpen ? ' open' : ''}`} tabIndex={0} role="button" aria-expanded={isOpen}
                  onClick={toggle} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } }}>
                  <td><b>{h.w}</b><small>{h.l.toUpperCase()}{h.t ? ` · ${h.t}` : ''}{h.r === 'skipped' ? ' · skipped' : ''}</small></td>
                  <td>{h.a == null ? '–' : `${h.a}%`}<br />
                    {h.e ? <span className={`flag ${h.a < 70 ? 'bad' : 'near'}`}>{h.e} error{h.e > 1 ? 's' : ''}</span>
                      : h.r === 'correct' ? <span className="flag ok">Clean</span> : null}
                  </td>
                  <td>{h.wpm == null ? '–' : h.wpm}</td>
                  <td>{h.p}<Icon n="chevron" className="chev" /></td>
                </tr>,
                isOpen && <tr key={`${id}d`} className="drow"><td colSpan="4"><Detail h={h} speak={speak} /></td></tr>,
              ];
            })}
            {!rows.length && <tr><td colSpan="4" className="empty">No words yet.</td></tr>}
          </tbody>
        </table>
        <div className="pager">
          <button disabled={pg === 0} onClick={() => { setPage(pg - 1); setOpen(null); }}>Previous</button>
          <span>{pg + 1} / {pages}</span>
          <button disabled={pg >= pages - 1} onClick={() => { setPage(pg + 1); setOpen(null); }}>Next</button>
          <button className="link" onClick={() => { if (window.confirm('Clear your word history and stats for all languages?')) { setHist([]); setPage(0); setOpen(null); } }}>Clear</button>
        </div>
      </div>
    </section>
  );
}
