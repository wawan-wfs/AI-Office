// Siklus 668: file fisik yMJRMIl…woff2 (duplikat byte-identik orbitron-latin.woff2,
// verifikasi fontTools: Orbitron variable wght 400-900, md5 sama) dihapus dari
// public/fonts — sejak siklus 662 tidak ada @font-face yang mereferensikannya,
// hanya menambah 11.5 KB dead-weight & entri precache PWA.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');

it('file duplikat yMJRMIl…woff2 dihapus dari public & dist', () => {
  for (const base of ['public', 'dist']) {
    expect(existsSync(resolve(root, base, 'fonts/yMJRMIlzdpvBhQQL_Qq7dy0.woff2'))).toBe(false);
  }
});

it('face Orbitron sah tetap ada: orbitron-latin.woff2 di public & dist', () => {
  for (const base of ['public', 'dist']) {
    const f = resolve(root, base, 'fonts/orbitron-latin.woff2');
    expect(existsSync(f)).toBe(true);
    expect(statSync(f).size).toBeGreaterThan(5000);
  }
});

it('tidak ada @font-face yang mereferensikan yMJRMIl (hanya komentar sejarah)', () => {
  for (const p of ['public/fonts/fonts.css', 'src/index.css', 'public/landing.html', 'index.html']) {
    const css = readFileSync(resolve(root, p), 'utf8');
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    for (const f of faces) expect(f).not.toContain('yMJRMIl');
  }
});

it('dist ter-build paritas: sw.js tidak lagi precache yMJRMIl', () => {
  const sw = readFileSync(resolve(root, 'dist/sw.js'), 'utf8');
  expect(sw).not.toContain('fonts/yMJRMIlzdpvBhQQL_Qq7dy0.woff2');
  const count = (sw.match(/url:"fonts\/[^"]*woff2"/g) || []).length;
  expect(count).toBe(10);
});
