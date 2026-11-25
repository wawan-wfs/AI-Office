import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  RM_POST, RM_TABLE_TOP, RM_TABLE_LEG, RM_CHAIR_DARK, RM_CHAIR_LEG,
  RM_WB_FRAME, RM_WB_TINT_NIGHT, RM_WB_TINT_DAY, RM_CLOCK_RIM,
  RM_PEND_ROD, RM_PEND_SHADE, RM_PEND_LIGHT, PB_FRAME_3D, PB_FRAME,
} from '../lib/ui_palette.js';

const RM = {
  RM_POST, RM_TABLE_TOP, RM_TABLE_LEG, RM_CHAIR_DARK, RM_CHAIR_LEG,
  RM_WB_FRAME, RM_WB_TINT_NIGHT, RM_WB_TINT_DAY, RM_CLOCK_RIM,
  RM_PEND_ROD, RM_PEND_SHADE, RM_PEND_LIGHT, PB_FRAME_3D,
};

describe('room_palette_454 — palet ruang meeting & bingkai papan proyek satu sumber', () => {
  it('nilai terkunci historis (13 konstanta)', () => {
    expect(RM).toEqual({
      RM_POST: 0x8fa1b4,
      RM_TABLE_TOP: 0xe7ecf1,
      RM_TABLE_LEG: 0xa9bccd,
      RM_CHAIR_DARK: 0x3a4a54,
      RM_CHAIR_LEG: 0x8a9ca6,
      RM_WB_FRAME: 0xbfc5ca,
      RM_WB_TINT_NIGHT: 0x2A3446,
      RM_WB_TINT_DAY: 0xffffff,
      RM_CLOCK_RIM: 0x2a2f36,
      RM_PEND_ROD: 0x2e3238,
      RM_PEND_SHADE: 0x22262b,
      RM_PEND_LIGHT: 0xffe8cc,
      PB_FRAME_3D: 0x1A263E,
    });
  });

  it('anti-poisoning: semua hex 24-bit valid', () => {
    for (const v of Object.values(RM)) {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(0xffffff);
    }
    // PB_FRAME_3D (mesh 3D) harus beda dari PB_FRAME (string kanvas)
    expect(typeof PB_FRAME_3D).toBe('number');
    expect(typeof PB_FRAME).toBe('string');
  });

  it('pemakaian di titik asal: room.js & projectboard.js delegasi ke konstanta', () => {
    const room = readFileSync(new URL('../scene/parts/room.js', import.meta.url), 'utf8');
    for (const k of ['RM_POST', 'RM_TABLE_TOP', 'RM_TABLE_LEG', 'RM_CHAIR_DARK', 'RM_CHAIR_LEG', 'RM_WB_FRAME', 'RM_WB_TINT_NIGHT', 'RM_WB_TINT_DAY', 'RM_CLOCK_RIM', 'RM_PEND_ROD', 'RM_PEND_SHADE', 'RM_PEND_LIGHT']) {
      expect(room).toContain(k);
    }
    const pb = readFileSync(new URL('../scene/parts/projectboard.js', import.meta.url), 'utf8');
    expect(pb).toContain('PB_FRAME_3D');
    expect(pb).toContain('color: PB_FRAME_3D');
  });

  it('room.js & projectboard.js bebas literal warna', () => {
    const room = readFileSync(new URL('../scene/parts/room.js', import.meta.url), 'utf8');
    const code = room.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
      // hex di komentar baris campuran juga dikecualikan: sisakan kode
      .replace(/\/\/.*$/gm, '');
    expect(code.match(/0x[0-9a-fA-F]{2,6}\b/g) ?? []).toHaveLength(0);
    const pb = readFileSync(new URL('../scene/parts/projectboard.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
    expect(pb.match(/0x[0-9a-fA-F]{2,6}\b/g) ?? []).toHaveLength(0);
  });
});
