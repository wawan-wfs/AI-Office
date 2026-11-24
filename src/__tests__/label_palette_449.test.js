import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LB_TEXT, LB_ROLE, AMBER_ACCENT } from '../lib/ui_palette.js';
import { drawZoneLabel } from '../scene/parts/zone_label_canvas.js';
import { drawLabelText, LABEL_FULL } from '../scene/parts/label_spec.js';
import { LC_TEXT } from '../lib/ui_palette.js';

describe('label_palette_449 — label & resepsionis satu sumber', () => {
  it('nilai terkunci historis (3 konstanta + reuse AMBER_ACCENT)', () => {
    expect(LC_TEXT).toBe('#FFFFFF'); // = ZL_TEXT (reuse, guard 408 anti-duplikat)
    expect(LB_TEXT).toBe('#fff');
    expect(LB_ROLE).toBe('#b8c4d4');
    expect(AMBER_ACCENT).toBe('#F59E0B'); // hex founder reception.js
  });

  it('anti-poisoning: nilai harus string hex valid', () => {
    const HEX = /^#[0-9a-fA-F]{3,6}$/;
    for (const v of [LC_TEXT, LB_TEXT, LB_ROLE, AMBER_ACCENT]) expect(v).toMatch(HEX);
  });

  it('pemakaian di titik asal (painter label memakai konstanta)', () => {
    const cmds = [];
    const ctx = new Proxy({}, {
      get: (_t, p) => (p === 'roundRect' ? undefined : () => cmds.push(['call'])),
      set: (t, p, v) => { cmds.push([p, v]); return true; },
    });
    drawZoneLabel(ctx, 'DEV DESK');
    expect(cmds.some(c => c[0] === 'fillStyle' && c[1] === LC_TEXT)).toBe(true);
    cmds.length = 0;
    drawLabelText(ctx, { name: 'Wahyu FS', hex: AMBER_ACCENT, role: 'Founder / CEO' }, LABEL_FULL, true);
    expect(cmds.some(c => c[0] === 'fillStyle' && c[1] === LB_TEXT)).toBe(true);
    expect(cmds.some(c => c[0] === 'fillStyle' && c[1] === LB_ROLE)).toBe(true);
  });

  it('0 literal hex tersisa di 3 file sumber', () => {
    for (const f of ['scene/parts/zone_label_canvas.js', 'scene/parts/label_spec.js', 'scene/parts/reception.js']) {
      const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
      const lit = src.match(/['"]#[0-9a-fA-F]{3,6}['"]/g) || [];
      expect(lit, f).toEqual([]);
    }
  });
});
