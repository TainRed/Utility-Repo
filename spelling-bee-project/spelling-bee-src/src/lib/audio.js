let ac = null;
let muted = false;
export const setMuted = (m) => { muted = m; };

export function wake() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    if (ac.state === 'suspended') ac.resume();
    return ac;
  } catch { return null; }
}

function tone(f, d = 0.12, type = 'sine', at = 0, v = 0.16) {
  if (muted) return;
  const c = wake();
  if (!c) return;
  try {
    const o = c.createOscillator(), g = c.createGain(), s = c.currentTime + at;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(v, s + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(g); g.connect(c.destination);
    o.start(s); o.stop(s + d + 0.02);
  } catch { /* ignore */ }
}

export const sfx = {
  tap: () => tone(700, 0.04, 'triangle', 0, 0.08),
  tick: (n) => tone(520 + n * 40, 0.14, 'triangle', 0, 0.18),
  ok: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', i * 0.09)),
  bad: () => { tone(170, 0.22, 'sawtooth', 0, 0.12); tone(140, 0.28, 'sawtooth', 0.2, 0.12); },
  skip: () => { tone(392, 0.15, 'square', 0, 0.07); tone(294, 0.2, 'square', 0.13, 0.07); },
  pick: () => tone(880, 0.08, 'sine', 0, 0.12),
  near: () => tone(440, 0.07, 'triangle', 0, 0.18),
  wrongKey: () => { tone(260, 0.07, 'square', 0, 0.1); tone(190, 0.1, 'square', 0.045, 0.1); },
};

export const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* ignore */ } };
