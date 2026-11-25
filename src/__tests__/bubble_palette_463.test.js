import { describe, it, expect } from 'vitest';
import { drawBubble, BUBBLE_BG } from '../scene/parts/bubble_canvas.js';
import { LB_TEXT } from '../lib/ui_palette.js';
import { readFileSync } from 'node:fs';

function mockCtx() {
  const ops = [];
  const handler = {
    get(t, p) {
      if (p === 'ops') return ops;
      if (typeof p === 'string' && ['fillRect', 'strokeRect', 'fillText', 'strokeText', 'fill', 'stroke', 'beginPath', 'moveTo', 'lineTo', 'arcTo', 'arc', 'ellipse', 'closePath', 'save', 'restore', 'translate', 'scale', 'roundRect', 'clip', 'quadraticCurveTo', 'bezierCurveTo', 'setLineDash', 'measureText'].includes(p)) {
        return (...a) => ops.push([p, ...a]);
      }
      if (p === 'createLinearGradient' || p === 'createRadialGradient') {
        return (...a) => { ops.push([p, ...a]); return { addColorStop: (o, c) => ops.push(['stop', o, c]) }; };
      }
      return t[p];
    },
    set(t, p, v) { ops.push([`set:${p}`, v]); return true; },
  };
  return new Proxy({}, handler);
}

describe('siklus 463 — palet bubble chat satu sumber', () => {
  it('nilai terkunci: BUBBLE_BG historis', () => {
    expect(BUBBLE_BG).toBe('rgba(7, 16, 32, 0.94)');
  });

  it('anti-poisoning delegasi: teks bubble = LB_TEXT', () => {
    expect(LB_TEXT).toBe('#fff');
    const ctx = mockCtx();
    drawBubble(ctx, 'halo', '#38BDF8');
    const sets = ctx.ops.filter((o) => o[0] === 'set:fillStyle');
    expect(sets).toContainEqual(['set:fillStyle', LB_TEXT]);
    // semua fillStyle = BUBBLE_BG atau LB_TEXT — tidak ada literal lain
    const allowed = [BUBBLE_BG, LB_TEXT];
    sets.forEach((s) => expect(allowed).toContain(s[1]));
  });

  it('pemakaian di titik asal: painter pakai BUBBLE_BG + LB_TEXT', () => {
    const ctx = mockCtx();
    drawBubble(ctx, 'x', '#38BDF8');
    expect(ctx.ops).toContainEqual(['set:fillStyle', BUBBLE_BG]);
    expect(ctx.ops).toContainEqual(['set:fillStyle', LB_TEXT]);
  });

  it('0 literal warna tersisa di bubble_canvas.js', () => {
    const src = readFileSync(new URL('../scene/parts/bubble_canvas.js', import.meta.url), 'utf8');
    const code = src.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('export const')).join('\n');
    const hits = code.match(/['"`]#[0-9A-Fa-f]{3,8}\b|['"`]rgba?\(/g) || [];
    expect(hits).toEqual([]);
  });
});
