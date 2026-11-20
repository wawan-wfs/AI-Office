// Siklus 659 — sitemap.xml hanya mencantumkan '/' padahal landing.html juga
// dilayani publik (:9503/landing.html 200).robots.txt sudah melarang /landing.html
// (duplikat), sehingga tidak boleh masuk sitemap — guard ini mengunci kontrak:
// tepat 1 URL, hanya '/', origin absolut konsisten dgn canonical & robots.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();
const src = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
const dist = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');

describe('siklus 659: sitemap kontrak landing', () => {
  test('tepat 1 <url>, loc = origin root /', () => {
    expect((src.match(/<url>/g) || []).length).toBe(1);
    expect(src).toContain('<loc>http://161.120.180.21:9503/</loc>');
  });
  test('landing.html TIDAK di sitemap (robots melarang duplikat)', () => {
    expect(robots).toContain('Disallow: /landing.html');
    expect(src).not.toContain('/landing.html');
  });
  test('origin sitemap == canonical landing', () => {
    const can = landing.match(/rel="canonical" href="([^"]+)"/)?.[1] ?? '';
    expect(can).toContain('161.120.180.21:9503/');
    expect(src).toContain('161.120.180.21:9503/');
  });
  test('dist sitemap paritas dgn sumber', () => {
    expect(dist).toBe(src);
  });
});
