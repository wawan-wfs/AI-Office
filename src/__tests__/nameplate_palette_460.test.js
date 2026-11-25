// Siklus 460: palet nameplate meja satu sumber (NP_ROLE, nama reuse LB_TEXT).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { LB_TEXT, NP_ROLE } from '../lib/ui_palette.js';
import { NAMEPLATE, drawNameplate } from '../scene/parts/nameplate_spec.js';

const SRC = readFileSync(fileURLToPath(new URL('../scene/parts/nameplate_spec.js', import.meta.url)), 'utf8');

describe('nameplate_palette_460', () => {
  it('nilai terkunci (nama = LB_TEXT #fff, role NP_ROLE #a8b4c6)', () => {
    expect(LB_TEXT).toBe('#fff');
    expect(NP_ROLE).toBe('#a8b4c6');
    expect(NAMEPLATE.NAME_COLOR).toBe(LB_TEXT);
    expect(NAMEPLATE.ROLE_COLOR).toBe(NP_ROLE);
  });

  it('anti-poisoning: delegasi ke ui_palette, bukan literal baru', () => {
    expect(SRC).toContain("NAME_COLOR: LB_TEXT");
    expect(SRC).toContain("ROLE_COLOR: NP_ROLE");
    expect(SRC).toContain("from '../../lib/ui_palette.js'");
  });

  it('pemakaian painter di titik asal (fillStyle nama & role)', () => {
    const cmds = [];
    const ctx = {
      canvas: {},
      measureText: (t) => ({ width: t.length * 6 }),
      fillText: () => cmds.push(['text']),
      fillRect: () => cmds.push(['rect']),
      beginPath: () => {},
      rect: () => {},
      fill: () => cmds.push(['fill']),
      roundRect: () => {},
    };
    ['font', 'textAlign', 'textBaseline', 'fillStyle'].forEach(k => {
      Object.defineProperty(ctx, k, { set(v) { if (k === 'fillStyle') cmds.push(['fillStyle', v]); }, get() { return null; } });
    });
    drawNameplate(ctx, 'wahyu', 'dev', '#10E5A0');
    const fills = cmds.filter(c => c[0] === 'fillStyle').map(c => c[1]);
    expect(fills).toContain(LB_TEXT);   // teks nama
    expect(fills).toContain(NP_ROLE);  // teks role
  });

  it('0 literal warna pada nameplate_spec.js', () => {
    const literals = SRC.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    expect(literals).toEqual([]);
  });
});
