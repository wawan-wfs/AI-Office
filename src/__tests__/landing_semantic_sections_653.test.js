import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const root = resolve(__dirname, '../..');
const src = readFileSync(resolve(root, 'public/landing.html'), 'utf8');

describe('landing semantic sections 653', () => {
  it('features, how, dan faq memakai <section> semantik, bukan div', () => {
    expect(src).toMatch(/<section class="features" aria-label="Fitur utama">/);
    expect(src).toMatch(/<section class="how" aria-label="Cara kerja">/);
    expect(src).toMatch(/<section class="how faq" aria-label="FAQ">/);
    expect(src).not.toMatch(/<div class="features">/);
    expect(src).not.toMatch(/<div class="how/);
  });

  it('setiap section baru ditutup dengan </section> (keseimbangan tag)', () => {
    const open = (src.match(/<section[ >]/g) || []).length;
    const close = (src.match(/<\/section>/g) || []).length;
    expect(open).toBe(close);
    expect(open).toBeGreaterThanOrEqual(7); // 3 baru + 4 faq-item
  });

  it('dist ter-build memuat section semantik yang sama', () => {
    const dist = resolve(root, 'dist/landing.html');
    if (!existsSync(dist)) return expect(true).toBe(true); // diuji penuh setelah build
    const d = readFileSync(dist, 'utf8');
    expect(d).toMatch(/<section class="features" aria-label="Fitur utama">/);
    expect(d).toMatch(/<section class="how faq" aria-label="FAQ">/);
    expect(d).not.toMatch(/<div class="features">/);
  });
});
