import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

const root = process.cwd();

function locsOf(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

describe('sitemap lastmod freshness 649', () => {
  const src = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
  const distPath = join(root, 'dist/sitemap.xml');
  const dist = existsSync(distPath) ? readFileSync(distPath, 'utf8') : null;

  test('root url has lastmod >= 2026-11-20', () => {
    expect(src).toMatch(/<loc>http:\/\/161\.120\.180\.21:9503\/<\/loc>\s*<lastmod>2026-11-(2\d|\d\d)<\/lastmod>/);
    const locs = locsOf(src);
    expect(locs).toContain('http://161.120.180.21:9503/');
    const block = src.split('<url>').find((b) => b.includes('<loc>http://161.120.180.21:9503/</loc>'));
    expect(block).toMatch(/<lastmod>2026-11-2\d<\/lastmod>/);
  });

  test('no stale 2026-11-19 lastmod remains', () => {
    expect(src).not.toMatch(/<lastmod>2026-11-19<\/lastmod>/);
  });

  test('dist sitemap matches source', () => {
    if (dist) {
      expect(dist).toBe(src);
    }
  });
});
