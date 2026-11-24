// Siklus 431: palet struktur ruangan & meja resepsionis satu sumber.
// Sebelumnya literal di parts/structure.js — karpet 0xD0D8E0, wainscot
// 0xEFE9DD, trim 0xC9BFA8, frame kaca 0xAABBCC (6 literal); dan parts/reception.js
// — meja 0x1A2A3A, top 0xDDE4EC, glow 0x4D9FFF, monitor 0xAABBCC/0x2A2A2A,
// layar 0x0A1628, kb/mouse 0x333333, kursi 0x37474F/0x94A3B8/0x64748B,
// Founder 0xF59E0B/0xB45309/0x292524/0x1a1a1a (20 literal).
// Nilai identik kode lama — tampilan tak berubah.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/ui_palette.js';

const struct = readFileSync(fileURLToPath(new URL('../scene/parts/structure.js', import.meta.url)), 'utf8');
const recep = readFileSync(fileURLToPath(new URL('../scene/parts/reception.js', import.meta.url)), 'utf8');

describe('structure & reception palette 431', () => {
  it('nilai historis terkunci', () => {
    expect(P.STRUCT_CARPET).toBe(0xD0D8E0);
    expect(P.STRUCT_WAINSCOT).toBe(0xEFE9DD);
    expect(P.STRUCT_WAINSCOT_TRIM).toBe(0xC9BFA8);
    expect(P.STRUCT_GLASS_FRAME).toBe(0xAABBCC);
    expect(P.RC_DESK_BODY).toBe(0x1A2A3A);
    expect(P.RC_DESK_TOP).toBe(0xDDE4EC);
    expect(P.RC_GLOW_TEAL).toBe(0x4D9FFF);
    expect(P.RC_MON_BODY).toBe(0x2A2A2A);
    expect(P.RC_SCREEN_BG).toBe(0x0A1628);
    expect(P.RC_PERIPH_DARK).toBe(0x333333);
    expect(P.RC_CHAIR_SHELL).toBe(0x37474F);
    expect(P.RC_FOUNDER_HAIR).toBe(0x1a1a1a);
    expect(P.RC_FOUNDER_SHIRT).toBe(0xB45309);
    expect(P.RC_FOUNDER_PANTS).toBe(0x292524);
    expect(P.RC_FOUNDER_ACCENT).toBe(0xF59E0B);
  });

  it('delegasi ke konstanta yang sudah ada (nilai sama, konstanta terpisah)', () => {
    expect(P.FURN_MONO_METAL).toBe(0xAABBCC);       // metal monitor resepsionis
    expect(P.FURN_CHAIR_POLE).toBe(0x94A3B8);
    expect(P.FURN_CHAIR_BASE).toBe(0x64748B);
    expect(P.LEAD_MON_BODY).toBe(0x2A2A2A);         // RC_MON_BODY terpisah
    expect(P.HELMET_BASE).toBe(0x1A2A3A);           // RC_DESK_BODY terpisah
    expect(P.RING_BLUE).toBe(0x4D9FFF);             // RC_GLOW_TEAL terpisah
    expect(P.RC_MON_BODY).not.toBe(P.RC_DESK_BODY); // anti-poisoning
    expect(P.RC_SCREEN_BG).not.toBe(P.RC_DESK_BODY);
  });

  it('delegasi dipakai di titik asal', () => {
    for (const c of ['STRUCT_CARPET','STRUCT_WAINSCOT','STRUCT_WAINSCOT_TRIM','STRUCT_GLASS_FRAME']) {
      expect(struct).toContain(c);
    }
    for (const c of ['RC_DESK_BODY','RC_DESK_TOP','RC_GLOW_TEAL','RC_MON_BODY','RC_SCREEN_BG',
      'RC_PERIPH_DARK','RC_CHAIR_SHELL','FURN_MONO_METAL','FURN_CHAIR_POLE','FURN_CHAIR_BASE',
      'RC_FOUNDER_HAIR','RC_FOUNDER_SHIRT','RC_FOUNDER_PANTS','RC_FOUNDER_ACCENT']) {
      expect(recep).toContain(c);
    }
  });

  it('0 literal tersisa di structure.js & reception.js', () => {
    for (const lit of ['0xD0D8E0','0xEFE9DD','0xC9BFA8','0xAABBCC','0x1A2A3A','0xDDE4EC',
      '0x4D9FFF','0x2A2A2A','0x0A1628','0x333333','0x37474F','0x94A3B8','0x64748B',
      '0xF59E0B','0xB45309','0x292524','0x1a1a1a']) {
      expect(struct).not.toContain(lit);
      expect(recep).not.toContain(lit);
    }
  });
});
