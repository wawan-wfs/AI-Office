// Siklus 543: guard anti-poisoning renderer 'board' (layar monitor PM).
// T.review / T.failed non-numerik (objek/array bentuk sah API) tidak boleh
// menghasilkan '[object Object]' di kanvas layar — koersi via safeText.
import { describe, it, expect } from 'vitest';
import { SCREEN_RENDERERS } from '../scene/parts/effects.js';

function stubCtx() {
  const calls = [];
  const ctx = {
    canvas: { width: 128, height: 96 },
    fillText(...a) { calls.push(['fillText', ...a]); },
    fillRect() {}, strokeRect() {}, clearRect() {},
    beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
    arc() {}, save() {}, restore() {}, setTransform() {},
    measureText: () => ({ width: 10 }),
    drawImage() {},
  };
  return { ctx, calls };
}

describe('board renderer poisoning guard (543)', () => {
  const board = SCREEN_RENDERERS.board;

  it('bentuk tak sah review/failed → tanpa [object Object]', () => {
    for (const review of [{ x: 1 }, ['a'], 'x']) {
      for (const failed of [{ y: 2 }, ['b'], 'y']) {
        const { ctx, calls } = stubCtx();
        global.window = { __tvData: { tasks: { total: 10, done: 4, review, failed } } };
        board(ctx, 128, 96, 1, '#38BDF8');
        global.window = undefined;
        const texts = calls.filter(c => c[0] === 'fillText').map(c => c[1]);
        expect(texts.some(t => String(t).includes('[object Object]'))).toBe(false);
      }
    }
  });

  it('bentuk sah numerik tetap utuh', () => {
    const { ctx, calls } = stubCtx();
    global.window = { __tvData: { tasks: { total: 10, done: 4, review: 2, failed: 1 } } };
    board(ctx, 128, 96, 1, '#38BDF8');
    global.window = undefined;
    const texts = calls.filter(c => c[0] === 'fillText').map(c => c[1]);
    expect(texts.some(t => /REVIEW: 2/.test(String(t)))).toBe(true);
    expect(texts.some(t => /GAGAL: 1/.test(String(t)))).toBe(true);
  });

  it('tanpa review → label on track', () => {
    const { ctx, calls } = stubCtx();
    global.window = { __tvData: { tasks: { total: 10, done: 4 } } };
    board(ctx, 128, 96, 1, '#38BDF8');
    global.window = undefined;
    const texts = calls.filter(c => c[0] === 'fillText').map(c => c[1]);
    expect(texts.some(t => /on track/.test(String(t)))).toBe(true);
  });
});
