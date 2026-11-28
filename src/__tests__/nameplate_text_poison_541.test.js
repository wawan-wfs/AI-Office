// Siklus 541: guard kontrak teks nameplate & label sprite — bentuk sah API non-string
// (null, undefined, objek, array, angka) tidak boleh menghasilkan '[object Object]'
// di kanvas nameplate meja (drawNameplate) maupun label sprite mengambang (drawLabelText).
import { describe, it, expect } from 'vitest';
import { titleCase, safeText, drawNameplate, NAMEPLATE } from '../scene/parts/nameplate_spec.js';
import { labelName, drawLabelText, LABEL_FULL } from '../scene/parts/label_spec.js';

function stubCtx() {
  const calls = { fill: [], font: [] };
  const c = {
    canvas: {},
    set fillStyle(v) { this._fs = v; }, get fillStyle() { return this._fs; },
    set font(v) { this._f = v; this.fonts.push(v); }, get font() { return this._f; },
    fonts: [],
    textAlign: '', textBaseline: '', globalAlpha: 1,
    fillRect(x, y, w, h) { calls.fill.push([x, y, w, h]); },
    fillText(t, x, y) { texts.push(t); },
    beginPath() {}, rect() {}, roundRect() {}, fill() {}, stroke() {},
    measureText(t) { return { width: String(t).length * 10 }; },
  };
  const texts = [];
  c.texts = texts;
  return { c, texts };
}

describe('safeText kontrak (541)', () => {
  it('koersi aman semua bentuk', () => {
    expect(safeText('Wahyu FS')).toBe('Wahyu FS');
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
    expect(safeText({ toxic: true })).toBe('');
    expect(safeText(['a'])).toBe('');
    expect(safeText(42)).toBe('42');
    expect(safeText(true)).toBe('true');
  });
  it('titleCase & labelName tak menghasilkan [object Object]', () => {
    expect(titleCase({ a: 1 })).toBe('');
    expect(labelName({ a: 1 })).toBe('');
    expect(titleCase(null)).toBe('');
    expect(titleCase('wahyu fs')).toBe('Wahyu FS');
    expect(labelName('bantuin ai')).toBe('Bantuin AI');
    expect(titleCase(123)).toBe('123');
  });
  it('drawNameplate & drawLabelText tanpa [object Object] utk bentuk tak sah', () => {
    for (const bad of [{ toxic: true }, ['x'], null, undefined]) {
      const { c, calls } = stubCtx();
      drawNameplate(c, bad, bad, '#38BDF8');
      expect(c.texts.join('|')).not.toContain('[object Object]');
      const s = stubCtx();
      drawLabelText(s.c, { name: bad, role: bad, hex: '#38BDF8' }, LABEL_FULL, true);
      expect(s.c.texts.join('|')).not.toContain('[object Object]');
    }
  });
  it('bentuk sah tetap utuh', () => {
    const { c } = stubCtx();
    drawNameplate(c, 'wahyu fs', 'Founder', '#38BDF8');
    expect(c.texts.some(t => t === 'Wahyu FS')).toBe(true);
    expect(c.texts.some(t => t === 'Founder')).toBe(true);
  });
});
