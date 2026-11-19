import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sm = readFileSync('public/sitemap.xml', 'utf8');
const rb = readFileSync('public/robots.txt', 'utf8');

describe('landing sitemap/robots 620', () => {
  it('sitemap hanya memuat URL kanonik /', () => {
    const locs = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    expect(locs).toEqual(['http://161.120.180.21:9503/']);
  });

  it('prioritas kanonik 1.0 dan tanpa landing.html', () => {
    expect(sm).toContain('<priority>1.0</priority>');
    expect(sm).not.toContain('landing.html');
  });

  it('sitemap punya lastmod format W3C (YYYY-MM-DD), tidak basi', () => {
    const m = sm.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/);
    expect(m).toBeTruthy();
    const d = new Date(`${m[1]}T00:00:00Z`);
    expect(Number.isNaN(d.getTime())).toBe(false);
    const diffDays = (Date.now() - d.getTime()) / 86400000;
    expect(diffDays).toBeGreaterThanOrEqual(0);
    expect(diffDays).toBeLessThan(30);
  });

  it('robots.txt memblokir /landing.html', () => {
    expect(rb).toMatch(/Disallow:\s*\/landing\.html/);
  });

  it('robots.txt tetap menyertakan directive Sitemap', () => {
    expect(rb).toContain('Sitemap: http://161.120.180.21:9503/sitemap.xml');
  });

  it('privat tetap diblokir', () => {
    expect(rb).toContain('Disallow: /app/');
    expect(rb).toContain('Disallow: /api/');
  });
});
