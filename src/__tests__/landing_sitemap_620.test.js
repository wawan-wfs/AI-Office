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
