import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
const html = readFileSync('public/landing.html', 'utf8');

describe('landing reduced-motion & decorative a11y (639)', () => {
  it('media query prefers-reduced-motion menonaktifkan transisi/transform dekoratif', () => {
    expect(html).toContain('@media (prefers-reduced-motion: reduce)');
    const mq = html.split('@media (prefers-reduced-motion: reduce)')[1].split('@media')[0];
    expect(mq).toContain('.tprog-fill');
    expect(mq).toContain('transition:none');
    expect(mq).toContain('transform:none');
  });

  it('glow dekoratif ditandai aria-hidden', () => {
    expect(html).toMatch(/<div class="glow g1" aria-hidden="true"><\/div><div class="glow g2" aria-hidden="true"><\/div>/);
  });

  it('fitur 626-638 tetap utuh (fetch wfs-api, progressbar a11y, grid 5 kolom)', () => {
    expect(html).toContain("fetch('/wfs-api/dashboard/stats')");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-labelledby="tprog-label"');
    expect(html).toContain('repeat(5,1fr)');
    expect(html).toContain('s-proj" lang="id">—');
    expect(html).toContain('s-task" lang="id">—');
  });
});
