import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../..');
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const dist = readFileSync(resolve(root, 'dist/landing.html'), 'utf8');
const fontsCss = readFileSync(resolve(root, 'public/fonts/fonts.css'), 'utf8');

const preloads = (html) =>
  [...html.matchAll(/<link rel="preload" href="([^"]+\.woff2)"/g)].map(m => m[1]);

describe('siklus 428: preload font landing (diperbarui siklus 455: DM Mono dihapus — landing tak memakai font mono)', () => {
  it('landing memuat 2 preload font (Orbitron selfhost, DM Sans)', () => {
    expect(preloads(landing).length).toBe(2);
  });

  it('landing tidak preload DM Mono (tidak dirender di landing)', () => {
    expect(preloads(landing).some(u => u.includes('dmmono'))).toBe(false);
  });

  it('setiap preload URL ada di @font-face (fonts.css atau selfhost index.css — tanpa URL basi)', () => {
    const used = new Set([
      ...fontsCss.matchAll(/url\(([^)]+\.woff2)\)/g).map(m => m[1]),
      // siklus 618: Orbitron memakai selfhost orbitron-latin.woff2 (identik byte
      // dengan yMJRMIl di fonts.css) sesuai paritas index.html siklus 427
      '/fonts/orbitron-latin.woff2',
    ]);
    for (const u of preloads(landing)) expect(used.has(u)).toBe(true);
  });

  it('preload punya as=font + crossorigin', () => {
    const tags = landing.match(/<link rel="preload"[^>]+woff2[^>]+>/g) || [];
    expect(tags.length).toBe(2);
    for (const t of tags) {
      expect(t).toContain('as="font"');
      expect(t).toContain('crossorigin');
    }
  });

  it('file fisik woff2 ada di public/fonts', () => {
    for (const u of preloads(landing)) {
      expect(existsSync(resolve(root, 'public', u.replace(/^\//, '')))).toBe(true);
    }
  });

  it('dist ter-deploy identik dengan public (2 preload)', () => {
    expect(preloads(dist)).toEqual(preloads(landing));
  });
});
