// Siklus 666: face DM Mono 300 (Light) dihapus dari fonts.css — audit siklus 664/665
// menunjukkan 0 pemakaian weight 300 pada font-family DM Mono di seluruh app & landing
// (CSS + komponen). File aFTR7PB1… (latin + latin-ext) dihapus dari public/fonts.
// Face DM Mono aktif: 400 Regular & 500 Medium (siklus 664).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../public/fonts/fonts.css', import.meta.url), 'utf8');

const faces = (t) => t.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const dmmono = faces(css).filter((f) => f.includes("'DM Mono'"));

it('fonts.css kini 9 blok @font-face (13 - 2 face DM Mono 300 - 2 face DM Sans italic 667)', () => {
  expect(faces(css).length).toBe(9);
});

it('tidak ada face DM Mono 300 tersisa; URL aFTR7PB1 dihapus', () => {
  expect(dmmono.some((f) => f.includes('font-weight: 300'))).toBe(false);
  expect(css).not.toContain('url(/fonts/aFTR7PB1');
});

it('face DM Mono aktif: tepat 400 & 500 per subset (4 face)', () => {
  const w = dmmono.map((f) => (f.match(/font-weight:\s*(\d+)/) || [])[1]).sort();
  expect(w).toEqual(['400', '400', '500', '500']);
  expect(dmmono.length).toBe(4);
});

it('file woff2 DM Mono 300 dihapus dari public & dist; face aktif tetap ada', () => {
  for (const base of ['public', 'dist']) {
    expect(() =>
      readFileSync(new URL(`../../${base}/fonts/aFTR7PB1QTsUX8KYvrGyEYOtbQ.woff2`, import.meta.url)),
    ).toThrow();
    expect(() =>
      readFileSync(new URL(`../../${base}/fonts/aFTU7PB1QTsUX8KYthqQBA.woff2`, import.meta.url)),
    ).not.toThrow();
    expect(() =>
      readFileSync(new URL(`../../${base}/fonts/dmmono-500-latin.woff2`, import.meta.url)),
    ).not.toThrow();
  }
});
