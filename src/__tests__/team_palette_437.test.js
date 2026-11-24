// Siklus 437 — guard palet warna tim satu sumber.
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';
import { TEAMS } from '../scene/parts/team_spec.js';

const spec = readFileSync(fileURLToPath(new URL('../scene/parts/team_spec.js', import.meta.url)), 'utf8');

it('TEAM_* terkunci nilai historis', () => {
  expect(palette.TEAM_BACKEND).toEqual({ color: '#22D3EE', hex: '#22D3EE' });
  expect(palette.TEAM_FRONTEND).toEqual({ color: '#F472B6', hex: '#F472B6' });
  expect(palette.TEAM_DEVOPS).toEqual({ color: '#34D399', hex: '#34D399' });
});

it('anti-poisoning: konstanta terpisah walau pola sama', () => {
  expect(palette.TEAM_BACKEND).not.toBe(palette.TEAM_FRONTEND);
  expect(palette.TEAM_FRONTEND).not.toBe(palette.TEAM_DEVOPS);
});

it('pemakaian di titik asal (team_spec.js)', () => {
  const be = TEAMS.find((t) => t.key === 'core-be');
  const fe = TEAMS.find((t) => t.key === 'fe-design');
  const dv = TEAMS.find((t) => t.key === 'ops-sec');
  expect(be.color).toBe('#22D3EE');
  expect(fe.hex).toBe('#F472B6');
  expect(dv.color).toBe('#34D399');
});

it('team_spec.js tanpa literal hex warna tim', () => {
  const hits = spec.match(/(color|hex):\s*'#/) || [];
  expect(hits.length).toBe(0);
});
