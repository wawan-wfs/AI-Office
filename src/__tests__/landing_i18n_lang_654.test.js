import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const root = resolve(__dirname, '../..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

describe('landing i18n lang attributes 654', () => {
  it('html[lang] tetap "id" di sumber & dist (guard anti-regresi)', () => {
    expect(read('public/landing.html')).toMatch(/<html lang="id">/);
    expect(read('dist/landing.html')).toMatch(/<html lang="id">/);
    expect(read('index.html')).toMatch(/<html lang="id">/);
    expect(read('dist/index.html')).toMatch(/<html lang="id">/);
  });

  it('semua elemen ber-teks landing punya atribut lang eksplisit', () => {
    const src = read('public/landing.html');
    // Kumpulkan seluruh elemen dengan konten ber-teks yang menuntut lang.
    const elems = src.match(/<(h1|h2|h3|p|li|b|span|title)\b[^>]*>/g) || [];
    const tagged = elems.filter((t) => /\blang=/.test(t));
    expect(elems.length).toBeGreaterThan(30);
    expect(tagged.length).toBe(elems.length);
    // Teks Inggris memakai lang="en", Indonesia lang="id" — tanpa nilai lain.
    expect(src).not.toMatch(/\blang="(?!(?:id|en)")[a-zA-Z-]*"/);
    expect(src).toMatch(/lang="en"/); // ada konten Inggris yang ditandai
  });

  it('dist ter-build memuat lang atribut yang sama (paritas)', () => {
    const d = read('dist/landing.html');
    expect(d).toMatch(/lang="en"/);
    const elems = d.match(/<(h1|h2|h3|p|li|b|span|title)\b[^>]*>/g) || [];
    expect(elems.filter((t) => /\blang=/.test(t)).length).toBe(elems.length);
  });
});
