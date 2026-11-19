import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const html = readFileSync('public/landing.html', 'utf8');
describe('landing stat grid 5 kolom (636)', () => {
  it('grid stats dektop 5 kolom sejak stat ke-5 ditambah', () => {
    expect(html).toMatch(/\.stats\s*{[^}]*repeat\(5,1fr\)/);
  });
  it('mobile 2 kolom dgn odd-stat span penuh (5 stat tidak yatim)', () => {
    expect(html).toMatch(/@media[^{]*720px[\s\S]*?\.stat:last-child:nth-child\(odd\)\s*{[^}]*span 2/);
  });
  it('jumlah .stat di landing = 5', () => {
    expect((html.match(/class="stat"/g) || []).length).toBe(5);
  });
});
