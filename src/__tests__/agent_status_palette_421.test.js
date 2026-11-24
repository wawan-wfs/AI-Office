// Siklus 421 — palet status live agen satu sumber (STATUS_HEX agent_status.js).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  GREEN_ACCENT, MEET_BLUE, AMBER_ACCENT, ACCENT_BLUE, STATUS_DIM,
} from '../lib/ui_palette.js';
import { STATUS_HEX } from '../scene/parts/agent_status.js';

const ROOT = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');

describe('agent status palette 421', () => {
  it('STATUS_HEX nilai historis terkunci (tampilan tak berubah)', () => {
    expect(STATUS_HEX.work).toBe('#10E5A0');
    expect(STATUS_HEX.meet).toBe('#60A5FA');
    expect(STATUS_HEX.lunch).toBe('#F59E0B');
    expect(STATUS_HEX.walk).toBe('#4D9FFF');
    expect(STATUS_HEX.dim).toBe('#8b93a3');
    expect(GREEN_ACCENT).toBe('#10E5A0');
    expect(MEET_BLUE).toBe('#60A5FA');
    expect(AMBER_ACCENT).toBe('#F59E0B');
    expect(ACCENT_BLUE).toBe('#4D9FFF');
    expect(STATUS_DIM).toBe('#8b93a3');
  });

  it('STATUS_HEX delegasi penuh ke ui_palette.js', () => {
    expect(STATUS_HEX.work).toBe(GREEN_ACCENT);
    expect(STATUS_HEX.meet).toBe(MEET_BLUE);
    expect(STATUS_HEX.lunch).toBe(AMBER_ACCENT);
    expect(STATUS_HEX.walk).toBe(ACCENT_BLUE);
    expect(STATUS_HEX.dim).toBe(STATUS_DIM);
  });

  it('0 literal warna status tersisa di agent_status.js', () => {
    const src = read('scene/parts/agent_status.js');
    for (const lit of ['#10E5A0', '#60A5FA', '#F59E0B', '#4D9FFF', '#8b93a3']) {
      expect(src.includes(lit)).toBe(false);
    }
  });

  it('anti-poisoning: MEET_BLUE ≠ SCREEN_INFO (kapitalisasi terpisah)', () => {
    // Pola siklus 418/419: warna sama nilai tapi konstanta terpisah agar
    // evolusi layar monitor vs status agen tak saling tarik.
    // eslint-disable-next-line
    const SCREEN_INFO = '#60a5fa';
    expect(MEET_BLUE).not.toBe(SCREEN_INFO);
    expect(MEET_BLUE.toLowerCase()).toBe(SCREEN_INFO);
    expect(STATUS_DIM).not.toBe('#8FA3BD'); // bukan SCENE_MUTED
  });
});
