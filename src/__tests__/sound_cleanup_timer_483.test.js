// Guard siklus 483: timer cleanup ramp ambience di sound_engine dilacak `pending`
// (di-clear di dispose) — anti setTimeout telanjang yang bisa menembak graph
// ambience mati pasca-dispose (pola bug kelas 124/482).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = readFileSync(
  fileURLToPath(new URL('../scene/parts/sound_engine.js', import.meta.url)),
  'utf8',
);

describe('ambience cleanup timer terlacak (483)', () => {
  it('setTimeout cleanup ramp dibungkus pelacak + push pending', () => {
    expect(src).toMatch(/const cleanupTimer = setTimeoutFn\(\(\) => \{/);
    expect(src).toMatch(/pending\.push\(cleanupTimer\);/);
  });

  it('tidak ada setTimeoutFn telanjang tersisa (semua id dilacak)', () => {
    // setTimeoutFn hanya boleh di assignment bernama (previewTimer / cleanupTimer),
    // tanpa pemanggilan telanjang `setTimeoutFn(() => {` tanpa `const x =`.
    const naked = [...src.matchAll(/(?<!const \w+ = )setTimeoutFn\(\s*\(\) => \{/g)]
      .map((m) => m.index);
    // callback cleanupTimer & chime-family memakai `const t = setTimeoutFn(...)` /
    // `const cleanupTimer = setTimeoutFn(...)`, stopAmbience ramp pakai cleanupTimer.
    expect(naked.length).toBe(0);
  });

  it('callback cleanup menghapus dirinya dari pending sebelum membersihkan nodes', () => {
    const m = src.match(/const cleanupTimer = setTimeoutFn\(\(\) => \{([\s\S]*?)\}, Math\.floor\(AMBIENCE_RAMP_SEC/);
    expect(m).not.toBeNull();
    const body = m[1];
    expect(body).toMatch(/pending\.indexOf\(cleanupTimer\)/);
    expect(body).toMatch(/pending\.splice/);
    expect(body.indexOf('pending.splice')).toBeLessThan(body.indexOf('cleanupAmbienceNodes'));
  });

  it('dispose tetap clear semua pending (kontrak anti-poisoning utuh)', () => {
    expect(src).toMatch(/pending\.forEach\(clearTimeoutFn\);/);
    expect(src).toMatch(/pending\.length = 0;/);
  });
});
