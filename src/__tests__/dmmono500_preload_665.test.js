// Siklus 665: preload font landing/index dialihkan ke face yang benar-benar dirender.
// aFTU7PB1…thqQBA = DM Mono REGULAR (400); teks mono app & landing memakai
// weight 500/600/700 (face Medium di-selfhost siklus 664) — preload kini dmmono-500-latin.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (p) => readFileSync(p, 'utf8');
const landing = read('public/landing.html');
const index = read('index.html');

it('tidak ada preload DM Mono 400 yang basi di kedua halaman', () => {
  for (const html of [landing, index]) {
    expect(html).not.toContain('/fonts/aFTU7PB1QTsUX8KYthqQBA.woff2');
  }
});

it('preload DM Mono 500 latin ada di landing & index (paritas)', () => {
  const tag = '<link rel="preload" href="/fonts/dmmono-500-latin.woff2" as="font" type="font/woff2" crossorigin>';
  expect(landing).toContain(tag);
  expect(index).toContain(tag);
});

it('file preload dmmono-500-latin ada di public & dist', () => {
  for (const base of ['public', 'dist']) {
    expect(() => readFileSync(new URL(`../../${base}/fonts/dmmono-500-latin.woff2`, import.meta.url))).not.toThrow();
  }
});

it('preload DM Mono 500 direferensikan @font-face fonts.css (tidak basi)', () => {
  const css = read('public/fonts/fonts.css');
  expect(css).toContain('url(/fonts/dmmono-500-latin.woff2)');
});
