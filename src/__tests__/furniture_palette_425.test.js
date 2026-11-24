import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as P from '../lib/ui_palette.js';

const osSrc = readFileSync(resolve(__dirname, '../scene/OfficeScene.js'), 'utf8');

describe('furniture desk & chair palette single-source (siklus 425)', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(P.FURN_DESK_TOP).toBe(0xF5EBE1);
    expect(P.FURN_DESK_LEG).toBe(0x1E293B);
    expect(P.FURN_MONO_METAL).toBe(0xAABBCC);
    expect(P.FURN_SCREEN_BODY).toBe(0x1E1E24);
    expect(P.FURN_INPUT_DARK).toBe(0x2A2A30);
    expect(P.FURN_CHAIR_SEAT).toBe(0x3B4A5A);
    expect(P.FURN_CHAIR_BACK).toBe(0x2E3B48);
    expect(P.FURN_PLATE_STAND).toBe(0x2E3642);
    expect(P.FURN_CHAIR_POLE).toBe(0x94A3B8);
    expect(P.FURN_CHAIR_BASE).toBe(0x64748B);
    expect(P.FURN_CABINET).toBe(0x46525E);
    expect(P.FURN_DRAWER).toBe(0x526270);
    expect(P.FURN_HANDLE).toBe(0x9AA7B4);
    expect(P.FURN_POT).toBe(0xB08050);
    expect(P.FURN_LEAF).toBe(0x43A047);
  });
  it('OfficeScene delegasi buildDesk ke konstanta palet', () => {
    expect(osSrc).toContain('M(FURN_DESK_TOP)');
    expect(osSrc).toContain('M(FURN_DESK_LEG)');
    expect(osSrc).toContain('M(FURN_MONO_METAL)');
    expect(osSrc).toContain('M(FURN_SCREEN_BODY)');
    expect(osSrc).toContain('M(FURN_INPUT_DARK)');
    expect(osSrc).toContain('M(FURN_CHAIR_SEAT)');
    expect(osSrc).toContain('M(FURN_CHAIR_BACK)');
    expect(osSrc).toContain('M(FURN_PLATE_STAND)');
    expect(osSrc).toContain('M(FURN_CHAIR_POLE)');
    expect(osSrc).toContain('M(FURN_CHAIR_BASE)');
    expect(osSrc).toContain('M(FURN_CABINET)');
    expect(osSrc).toContain('M(FURN_DRAWER)');
    expect(osSrc).toContain('M(FURN_HANDLE)');
    expect(osSrc).toContain('M(FURN_POT)');
    expect(osSrc).toContain('M(FURN_LEAF)');
  });
  it('0 literal perabot tersisa di lokasi asal', () => {
    for (const lit of ['0xF5EBE1','0xAABBCC','0x1E1E24','0x2A2A30','0x3B4A5A','0x2E3B48','0x2E3642','0x94A3B8','0x64748B','0x46525E','0x526270','0x9AA7B4','0xB08050','0x43A047'])
      expect(osSrc.includes(lit)).toBe(false);
  });
  it('anti-poisoning: konstanta mirip tetap terpisah', () => {
    expect(P.FURN_CHAIR_BACK).not.toBe(P.FURN_PLATE_STAND);
    expect(P.FURN_DESK_LEG).not.toBe(P.FURN_CHAIR_BACK);
    expect(P.FURN_DRAWER).not.toBe(P.FURN_CABINET);
    expect(P.FURN_MONO_METAL).not.toBe(P.FURN_HANDLE);
  });
});
