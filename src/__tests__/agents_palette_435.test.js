import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const spec = readFileSync(fileURLToPath(new URL('../scene/parts/agents_spec.js', import.meta.url)), 'utf8');

it('AG_* outfit terkunci nilai historis', () => {
  expect(palette.AG_BANTUIN).toEqual({ hair: 0x1a1a2e, shirt: 0x0B4F3A, pants: 0x08281F });
  expect(palette.AG_BUDI).toEqual({ hair: 0x222222, shirt: 0x1E3A8A, pants: 0x111827 });
  expect(palette.AG_RIZKY).toEqual({ hair: 0x1a1a1a, shirt: 0x155E75, pants: 0x164E63 });
  expect(palette.AG_DEWI).toEqual({ hair: 0x4A148C, shirt: 0x9D174D, pants: 0x1a1a2e });
  expect(palette.AG_ANDI).toEqual({ hair: 0x3E2723, shirt: 0x92400E, pants: 0x263238 });
  expect(palette.AG_YOGA).toEqual({ hair: 0x111111, shirt: 0x1D4ED8, pants: 0x1F2937 });
  expect(palette.AG_MAYA).toEqual({ hair: 0x4E342E, shirt: 0x6D28D9, pants: 0x1a1a2e });
  expect(palette.AG_TONI).toEqual({ hair: 0x263238, shirt: 0x065F46, pants: 0x212121 });
  expect(palette.AG_RINA).toEqual({ hair: 0x5D1A1A, shirt: 0x9F1239, pants: 0x1F2937 });
  expect(palette.AG_LINA).toEqual({ hair: 0x3E2723, shirt: 0xC2410C, pants: 0x292524 });
  expect(palette.AG_SARI).toEqual({ hair: 0x2D1B0E, shirt: 0xB45309, pants: 0x1C1917 });
  expect(palette.AG_TRAINER).toEqual({ hair: 0x111827, shirt: 0x4C1D95, pants: 0x1E1B4B });
  expect(palette.AG_INTEGRATOR).toEqual({ hair: 0x0F172A, shirt: 0x155E75, pants: 0x083344 });
  expect(palette.AG_SUPPORT).toEqual({ hair: 0x3B2412, shirt: 0x3F6212, pants: 0x1A2E05 });
});

it('outfit agen terpisah (anti-poisoning)', () => {
  // shirt BUDI ≠ shirt RIZKY walau keduanya biru; masing-masing objek mandiri
  expect(palette.AG_BUDI).not.toBe(palette.AG_RIZKY);
  expect(palette.AG_BUDI.shirt).not.toBe(palette.AG_RIZKY.shirt);
  expect(palette.AG_MAYA).not.toBe(palette.AG_DEWI);
});

it('agents_spec.js memakai AG_* di titik asal', () => {
  expect(spec).toContain('AG_BANTUIN)');
  expect(spec).toContain('AG_INTEGRATOR)');
  expect(spec).toContain('agentColorFromHex(hex)');
});

it('agents_spec.js 0 literal hex blok AG tersisa', () => {
  const code = spec.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code.match(/0x[0-9A-Fa-f]{6}/g) ?? []).toEqual([]);
});
