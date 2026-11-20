import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// Guard 663: landing.html harus punya @font-face Orbitron sendiri
// (landing tidak load bundle CSS app; fonts.css tidak lagi deklarasikan Orbitron).

const html = readFileSync('public/landing.html', 'utf8');
const distLanding = readFileSync('dist/landing.html', 'utf8');
const fontsCss = readFileSync('public/fonts/fonts.css', 'utf8');
const distCss = readdirSync('dist/assets')
  .filter(f => f.startsWith('src-') && f.endsWith('.css'))
  .map(f => readFileSync('dist/assets/' + f, 'utf8'))
  .join('\n');

describe('landing Orbitron @font-face (663)', () => {
  it('fonts.css tidak lagi deklarasikan Orbitron (deklarasi tunggal)', () => {
    const n = (fontsCss.match(/font-family:\s*['"]?Orbitron/g) || []).length;
    expect(n).toBe(0);
  });

  it('landing.html punya @font-face Orbitron variable 400 900 → orbitron-latin.woff2', () => {
    const m = html.match(/@font-face\s*\{[^}]*font-family:\s*'Orbitron'[^}]*font-weight:\s*400 900[^}]*\/fonts\/orbitron-latin\.woff2[^}]*\}/);
    expect(m).toBeTruthy();
  });

  it('bundle app CSS tetap punya deklarasi Orbitron variable', () => {
    expect(distCss).toContain('Orbitron');
    expect(distCss).toContain('font-weight:400 900');
  });

  it('dist/landing.html paritas dgn sumber', () => {
    expect(distLanding).toContain("font-family: 'Orbitron'");
    expect(distLanding).toContain('/fonts/orbitron-latin.woff2');
  });
});
