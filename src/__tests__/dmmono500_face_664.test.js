// Siklus 664: DM Mono 500 (Medium) di-selfhost — app memakai weight 600/700 pada
// teks DM Mono; tanpa face 500 browser memilih 400 lalu menambah synthetic bold.
// Sekarang: face 500 asli tersedia di fonts.css (latin + latin-ext), statis (tanpa axis).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../public/fonts/fonts.css', import.meta.url), 'utf8');
const dist = readFileSync(new URL('../../dist/fonts/fonts.css', import.meta.url), 'utf8');

const faces = (t) => t.match(/@font-face\s*\{[^}]*\}/g) ?? [];

it('fonts.css berisi 13 blok @font-face (12 lama + 2 face DM Mono 500)', () => {
  expect(faces(css).length).toBe(13);
});

it('ada face DM Mono 500 untuk latin & latin-ext', () => {
  const mono500 = faces(css).filter(
    (f) => f.includes("'DM Mono'") && f.includes('font-weight: 500'),
  );
  expect(mono500.length).toBe(2);
  expect(mono500.join('\n')).toContain('/fonts/dmmono-500-latin.woff2');
  expect(mono500.join('\n')).toContain('/fonts/dmmono-500-latin-ext.woff2');
});

it('file woff2 DM Mono 500 ada di public/fonts', () => {
  const pub = new URL('../../public/fonts/', import.meta.url).pathname;
  for (const f of ['dmmono-500-latin.woff2', 'dmmono-500-latin-ext.woff2']) {
    expect(() => readFileSync(pub + f)).not.toThrow();
  }
});

it('paritas dist/fonts/fonts.css', () => {
  expect(dist).toBe(css);
  expect(faces(dist).length).toBe(13);
});
