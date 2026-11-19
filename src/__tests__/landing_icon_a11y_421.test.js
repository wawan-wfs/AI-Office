import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const src = readFileSync('public/landing.html', 'utf8');
let dist = '';
try { dist = readFileSync('/home/agentuser/wfs-hq/landing.html', 'utf8'); } catch {}

describe('siklus 421: ikon landing diberi label a11y', () => {
  it('semua ikon kartu fitur punya role=img + aria-label', () => {
    const ics = src.match(/class="ic"[^>]*>/g) || [];
    expect(ics.length).toBe(6);
    for (const ic of ics) {
      expect(ic).toContain('role="img"');
      expect(ic).toContain('aria-label=');
    }
  });

  it('emoji di link CTA dibungkus aria-hidden', () => {
    expect(src).toContain('<span aria-hidden="true" lang="id">🚀</span>');
    expect(src).toContain('<span aria-hidden="true" lang="id">📊</span>');
    expect(src).not.toMatch(/href="\/app\/">🚀/);
  });

  it('dist ter-deploy memuat label juga', () => {
    if (dist) {
      expect(dist.match(/role="img"/g)?.length).toBe(6);
      expect(dist).toContain('aria-hidden="true" lang="id">🚀');
    }
  });

  it('tidak mengubah struktur lain (8 h2: 6 fitur + Cara Kerja + FAQ)', () => {
    expect(src.match(/<h2 lang="id">/g)?.length).toBe(8);
    expect(src).toContain('application/ld+json');
  });
});
