/**
 * Hand-drawn stroke generators, ported from the BlueCode brand kit
 * (bluecode-animacion/assets/brand-kit/sketch.ts).
 *
 * Everything is deterministic: same seed, same stroke. Paths are generated
 * at build time, so the browser only receives static SVG.
 */

export type Pt = [number, number];

/** Deterministic 0..1 from a string seed (FNV-1a + xorshift mix). */
export const random = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return ((h >>> 0) % 100000) / 100000;
};

const j = (seed: string, i: number, amp: number) => (random(`${seed}·${i}`) - 0.5) * 2 * amp;
const f = (n: number) => n.toFixed(1);

/** Points to a smooth curve (Catmull-Rom to cubic Bézier). */
export const smoothPath = (pts: Pt[]): string => {
  if (pts.length < 2) return '';
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};

/** A "freehand" straight line: slightly bowed, imprecise ends. */
export const sketchLine = (a: Pt, b: Pt, seed: string, rough = 1): string => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const bow = Math.min(len * 0.025, 10) * rough;
  const nx = -(b[1] - a[1]) / (len || 1);
  const ny = (b[0] - a[0]) / (len || 1);
  const k = j(seed, 1, bow);
  const m: Pt = [(a[0] + b[0]) / 2 + nx * k, (a[1] + b[1]) / 2 + ny * k];
  const s: Pt = [a[0] + j(seed, 2, 2 * rough), a[1] + j(seed, 3, 2 * rough)];
  const e: Pt = [b[0] + j(seed, 4, 2 * rough), b[1] + j(seed, 5, 2 * rough)];
  return `M ${f(s[0])} ${f(s[1])} Q ${f(m[0])} ${f(m[1])} ${f(e[0])} ${f(e[1])}`;
};

/**
 * Hand rectangle in one continuous stroke that overshoots a little when it
 * closes (the way a box is closed with a pen).
 */
export const sketchRect = (w: number, h: number, seed: string, rough = 1, pad = 0): string => {
  const a = 4 * rough;
  const c: Pt[] = [
    [pad + j(seed, 1, a), pad + j(seed, 2, a)],
    [pad + w + j(seed, 3, a), pad + j(seed, 4, a)],
    [pad + w + j(seed, 5, a), pad + h + j(seed, 6, a)],
    [pad + j(seed, 7, a), pad + h + j(seed, 8, a)],
  ];
  const overshoot: Pt = [c[0][0] + Math.min(40, w * 0.12), c[0][1] + j(seed, 9, a * 0.8) - 2];
  const side = (p: Pt, q: Pt, i: number) => {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const nx = -(q[1] - p[1]) / (len || 1);
    const ny = (q[0] - p[0]) / (len || 1);
    const k = j(seed, 20 + i, Math.min(len * 0.012, 6) * rough);
    return ` Q ${f((p[0] + q[0]) / 2 + nx * k)} ${f((p[1] + q[1]) / 2 + ny * k)} ${f(q[0])} ${f(q[1])}`;
  };
  return (
    `M ${f(c[0][0])} ${f(c[0][1])}` +
    side(c[0], c[1], 0) +
    side(c[1], c[2], 1) +
    side(c[2], c[3], 2) +
    side(c[3], c[0], 3) +
    side(c[0], overshoot, 4)
  );
};

/** Hand ellipse that goes ~1.1 turns (circling something with a pen). */
export const sketchEllipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string,
  rough = 1,
): string => {
  const start = -Math.PI * 0.75 + j(seed, 1, 0.3);
  const turns = 1.12;
  const n = 18;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = start + (i / n) * Math.PI * 2 * turns;
    const drift = 1 + (i / n) * 0.06 * rough + j(seed, 10 + i, 0.025 * rough);
    pts.push([cx + Math.cos(t) * rx * drift, cy + Math.sin(t) * ry * drift]);
  }
  return smoothPath(pts);
};

/** Curved arrow a → b. Positive `bend` curves to the left of the direction. */
export const sketchArrow = (
  a: Pt,
  b: Pt,
  seed: string,
  bend = 0.18,
  head = 34,
): { shaft: string; head: string } => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const nx = -(b[1] - a[1]) / (len || 1);
  const ny = (b[0] - a[0]) / (len || 1);
  const k = bend * len + j(seed, 1, len * 0.03);
  const c: Pt = [(a[0] + b[0]) / 2 + nx * k, (a[1] + b[1]) / 2 + ny * k];
  const shaft = `M ${f(a[0] + j(seed, 2, 2))} ${f(a[1] + j(seed, 3, 2))} Q ${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;
  const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
  const spread = 0.48 + j(seed, 4, 0.06);
  const h1: Pt = [b[0] - Math.cos(ang - spread) * head, b[1] - Math.sin(ang - spread) * head];
  const h2: Pt = [
    b[0] - Math.cos(ang + spread) * head * (0.9 + j(seed, 5, 0.1)),
    b[1] - Math.sin(ang + spread) * head * (0.9 + j(seed, 5, 0.1)),
  ];
  return {
    shaft,
    head: `M ${f(h1[0])} ${f(h1[1])} L ${f(b[0])} ${f(b[1])} L ${f(h2[0])} ${f(h2[1])}`,
  };
};

/** Underline with a "return" (the pen doubles back a little). */
export const sketchUnderline = (w: number, seed: string, y = 10, doubleBack = true): string => {
  const a: Pt = [j(seed, 1, 4), y + j(seed, 2, 3)];
  const b: Pt = [w + j(seed, 3, 6), y - 4 + j(seed, 4, 3)];
  const mid: Pt = [w / 2, y + 6 + j(seed, 5, 4)];
  let d = `M ${f(a[0])} ${f(a[1])} Q ${f(mid[0])} ${f(mid[1])} ${f(b[0])} ${f(b[1])}`;
  if (doubleBack) {
    const back: Pt = [w * 0.18 + j(seed, 6, 10), y + 10 + j(seed, 7, 3)];
    d += ` Q ${f(w * 0.6)} ${f(y + 14)} ${f(back[0])} ${f(back[1])}`;
  }
  return d;
};

/** Long horizontal route with a freehand wobble, through fixed stations. */
export const sketchRoute = (w: number, y: number, seed: string, amp = 14): string => {
  const n = 24;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const wave = Math.sin((i / n) * Math.PI * 5) * amp * 0.6;
    pts.push([x, y + wave + j(seed, i, amp * 0.35)]);
  }
  return smoothPath(pts);
};
