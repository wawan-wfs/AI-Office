import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const spec = readFileSync(fileURLToPath(new URL('../scene/parts/extended_desks.js', import.meta.url)), 'utf8');

it('EX_* outfit terkunci nilai historis', () => {
  expect(palette.EX_ARIS).toEqual({ hair: 0x222222, shirt: 0x0E7490, pants: 0x164E63 });
  expect(palette.EX_CLARA).toEqual({ hair: 0x4A148C, shirt: 0xBE185D, pants: 0x1A1A2E });
  expect(palette.EX_RIAN).toEqual({ hair: 0x1E293B, shirt: 0x0284C7, pants: 0x0F172A });
  expect(palette.EX_TARI).toEqual({ hair: 0x312E81, shirt: 0x7E22CE, pants: 0x1E1B4B });
  expect(palette.EX_FERRY).toEqual({ hair: 0x1E293B, shirt: 0x0891B2, pants: 0x0F172A });
  expect(palette.EX_GILANG).toEqual({ hair: 0x111827, shirt: 0x0369A1, pants: 0x1E293B });
  expect(palette.EX_HENDRA).toEqual({ hair: 0x111827, shirt: 0x059669, pants: 0x1E293B });
  expect(palette.EX_DONI).toEqual({ hair: 0x1F2937, shirt: 0x047857, pants: 0x064E3B });
  expect(palette.EX_SECBOT).toEqual({ hair: 0x000000, shirt: 0xB91C1C, pants: 0x18181B });
  expect(palette.EX_BAGAS).toEqual({ hair: 0x450A0A, shirt: 0x991B1B, pants: 0x18181B });
  expect(palette.EX_NINA).toEqual({ hair: 0x3E2723, shirt: 0xD97706, pants: 0x292524 });
  expect(palette.EX_CITRA).toEqual({ hair: 0x78350F, shirt: 0xB45309, pants: 0x451A03 });
});

it('outfit spesialis terpisah (anti-poisoning)', () => {
  // FERRY & RIAN share pants hex tapi objek tetap mandiri; shirt GILANG ≠ RIAN walau biru
  expect(palette.EX_FERRY).not.toBe(palette.EX_RIAN);
  expect(palette.EX_GILANG).not.toBe(palette.EX_RIAN);
  expect(palette.EX_GILANG.shirt).not.toBe(palette.EX_RIAN.shirt);
  expect(palette.EX_BAGAS).not.toBe(palette.EX_SECBOT);
});

it('extended_desks.js memakai EX_* di titik asal', () => {
  expect(spec).toContain('EX_ARIS,');
  expect(spec).toContain("1, EX_ARIS,");
  expect(spec).toContain("3, EX_CITRA,");
  expect(spec).toContain('agentColorFromHex(hex)');
});

it('extended_desks.js 0 literal hex tersisa', () => {
  const code = spec.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code.match(/0x[0-9A-Fa-f]{6}/g) ?? []).toEqual([]);
});
