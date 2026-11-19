// Siklus 655: skip-link landing tanpa inline handler onFocus/onBlur — CSS-only
// (paritas dgn index.css: .skip-link.vis + :focus-visible/:focus menampilkan link).
// Inline handler JS di HTML menghalangi CSP strict & kualitas markup.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
const pub = readFileSync('public/landing.html', 'utf8');
const dist = readFileSync('dist/landing.html', 'utf8');

describe('landing skip-link CSS-only (655)', () => {
  it('tidak ada inline onFocus/onBlur pada skip-link', () => {
    expect(pub).not.toMatch(/skip-link[^>]*on[Ff]ocus/);
    expect(pub).not.toMatch(/skip-link[^>]*on[Bb]lur/);
    expect(pub).toMatch(/class="skip-link" href="#main">Lewati ke konten utama<\/a>/);
  });

  it('CSS menampilkan skip-link via fokus (vis, focus-visible, focus)', () => {
    expect(pub).toMatch(/\.skip-link\.vis,\s*\.skip-link:focus-visible,\s*\.skip-link:focus\s*\{\s*top:10px/);
  });

  it('dist ter-build paritas dgn sumber', () => {
    expect(dist).not.toMatch(/skip-link[^>]*on[Ff]ocus/);
    expect(dist).toMatch(/\.skip-link\.vis,\s*\.skip-link:focus-visible,\s*\.skip-link:focus\s*\{\s*top:10px/);
    expect(dist).toContain('Lewati ke konten utama');
  });
});
