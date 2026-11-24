import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  PS_SHIP, PS_KUALITAS, PS_BUILD, PS_TEST, PS_WFS,
  PS_FOKUS, PS_SELESAIKAN, PS_ANTAR,
} from '../lib/ui_palette.js';
import { POSTERS } from '../scene/parts/poster_spec.js';

const PS = {
  PS_SHIP, PS_KUALITAS, PS_BUILD, PS_TEST,
  PS_WFS, PS_FOKUS, PS_SELESAIKAN, PS_ANTAR,
};

describe('poster_palette_448 — palet poster dinding satu sumber', () => {
  it('nilai terkunci historis (8 konstanta PS_*)', () => {
    expect(PS).toEqual({
      PS_SHIP: '#0deef3',
      PS_KUALITAS: '#f5a623',
      PS_BUILD: '#ff5252',
      PS_TEST: '#7c4dff',
      PS_WFS: '#00e676',
      PS_FOKUS: '#ffca28',
      PS_SELESAIKAN: '#40c4ff',
      PS_ANTAR: '#ff80ab',
    });
  });

  it('anti-poisoning: nilai harus string hex 6 digit', () => {
    const HEX = /^#[0-9a-f]{6}$/i;
    for (const [k, v] of Object.entries(PS)) {
      expect(typeof v, k).toBe('string');
      expect(v, k).toMatch(HEX);
    }
  });

  it('pemakaian di titik asal: POSTERS delegasi penuh ke konstanta PS_*', () => {
    const titles = ['SHIP IT', 'KUALITAS DULU', 'BUILD DAILY', 'TEST EVERYTHING',
      'WFS PROJECT', 'FOKUS', 'SELESAIKAN', 'ANTAR TEPAT WAKTU'];
    const values = [PS_SHIP, PS_KUALITAS, PS_BUILD, PS_TEST,
      PS_WFS, PS_FOKUS, PS_SELESAIKAN, PS_ANTAR];
    expect(POSTERS.map((p) => p.t)).toEqual(titles);
    expect(POSTERS.map((p) => p.c)).toEqual(values);
    for (const p of POSTERS) {
      expect(Object.values(PS), p.t).toContain(p.c);
    }
  });

  it('poster_spec.js bebas literal hex', () => {
    const src = readFileSync(new URL('../scene/parts/poster_spec.js', import.meta.url), 'utf8');
    expect(src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toHaveLength(0);
  });
});
