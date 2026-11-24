// Siklus 426: palet duct/plafon + trophy & cincin meja lead satu sumber.
// Sebelumnya literal di OfficeScene.js (duct 0xCCCCCC/0xBBBBBB, vent 0xDDDDDD,
// garis 0xAAAAAA, tabung 0x334466, monitor lead 0x2A2A2A + hex '#60A5FA',
// helmet 0x1A2A3A/0xDDDDDD, ring/visor/glow 0x4D9FFF, panel 0xF0F4FF, partikel
// 0xFFFFFF). Nilai identik kode lama — tampilan tak berubah.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/ui_palette.js';

const sceneSrc = readFileSync(fileURLToPath(new URL('../scene/OfficeScene.js', import.meta.url)), 'utf8');

describe('duct & trophy palette 426', () => {
  it('nilai historis terkunci', () => {
    expect(P.DUCT_LIGHT).toBe(0xCCCCCC);
    expect(P.DUCT_CROSS).toBe(0xBBBBBB);
    expect(P.DUCT_VENT).toBe(0xDDDDDD);
    expect(P.DUCT_LINE).toBe(0xAAAAAA);
    expect(P.TUBE_NEON).toBe(0x334466);
    expect(P.LEAD_MON_BODY).toBe(0x2A2A2A);
    expect(P.LEAD_MON_HEX).toBe('#60A5FA');
    expect(P.HELMET_BASE).toBe(0x1A2A3A);
    expect(P.HELMET_BODY).toBe(0xDDDDDD);
    expect(P.RING_BLUE).toBe(0x4D9FFF);
    expect(P.PARTICLE_WHITE).toBe(0xFFFFFF);
  });

  it('OfficeScene delegasi — konstanta dipakai di titik asal', () => {
    for (const c of ['DUCT_LIGHT','DUCT_CROSS','DUCT_VENT','DUCT_LINE','TUBE_NEON',
      'LEAD_MON_BODY','LEAD_MON_HEX','HELMET_BASE','HELMET_BODY','RING_BLUE','PARTICLE_WHITE','CEIL_PANEL_DAY']) {
      expect(sceneSrc).toContain(c);
    }
    expect(sceneSrc).toContain("hex:LEAD_MON_HEX");
  });

  it('0 literal duct/trophy tersisa di OfficeScene.js', () => {
    for (const lit of ['0xCCCCCC','0xBBBBBB','0xDDDDDD','0xAAAAAA','0x334466','0x2A2A2A',
      '0x1A2A3A','0x4D9FFF','0xF0F4FF',"hex:'#60A5FA'"]) {
      expect(sceneSrc).not.toContain(lit);
    }
  });

  it('anti-poisoning: RING_BLUE terpisah dari konstanta biru lain', () => {
    expect(P.RING_BLUE).not.toBe(parseInt(P.MEET_BLUE, 16));
    // nilai sama 0xDDDDDD historis, tapi konstanta terpisah agar evolusi tak saling tarik
    expect(P.HELMET_BODY).toBe(P.DUCT_VENT);
  });
});
