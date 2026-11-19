import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const src = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const distHtml = resolve(root, 'dist/landing.html');

describe('Siklus 642 — og:image:type lengkap', () => {
  it('landing pub memuat og:image:type image/png setelah og:image:alt', () => {
    expect(src).toMatch(/<meta property="og:image:type" content="image\/png">/);
    expect(src.indexOf('og:image:alt')).toBeLessThan(src.indexOf('og:image:type'));
  });

  it('og:image.png memang PNG valid (magic bytes) di public/', () => {
    const p = resolve(root, 'public/og-image.png');
    expect(existsSync(p)).toBe(true);
    const buf = readFileSync(p);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('\x89PNG');
  });

  it('dist ter-deploy memuat og:image:type (paritas dgn pub)', () => {
    if (existsSync(distHtml)) {
      expect(readFileSync(distHtml, 'utf8')).toMatch(/og:image:type" content="image\/png"/);
    }
  });
});
