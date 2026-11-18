import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const read = (p) => readFileSync(p, 'utf8');

describe('Siklus 623: preload fonts.css paritas index vs landing', () => {
  const index = read('index.html');
  const landing = read('public/landing.html');
  const re = /<link rel="preload" href="\/fonts\/fonts\.css" as="style"\s*\/?>/g;

  it('index.html preload fonts.css as=style', () => {
    expect(index.match(re)).toHaveLength(1);
  });

  it('landing.html kini juga preload fonts.css as=style', () => {
    expect(landing.match(re)).toHaveLength(1);
  });

  it('kedua halaman tetap memuat stylesheet fonts.css (tanpa duplikat)', () => {
    expect(index.match(/<link rel="stylesheet" href="\/fonts\/fonts\.css" \/>/g)).toHaveLength(1);
    expect(landing.match(/<link rel="stylesheet" href="\/fonts\/fonts\.css">/g)).toHaveLength(1);
  });
});
