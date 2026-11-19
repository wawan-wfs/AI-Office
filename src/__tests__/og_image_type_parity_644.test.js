import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const app = readFileSync(resolve(root, 'index.html'), 'utf8');
const lnd = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const distApp = resolve(root, 'dist/index.html');
const distLnd = resolve(root, 'dist/landing.html');

describe('Siklus 644 — paritas og:image:type antar halaman', () => {
  it('index.html (app shell) memuat og:image:type image/png setelah og:image:alt', () => {
    expect(app).toMatch(/<meta property="og:image:type" content="image\/png" \/>/);
    expect(app.indexOf('og:image:alt')).toBeLessThan(app.indexOf('og:image:type'));
    expect(app.match(/og:image:type/g)).toHaveLength(1);
  });

  it('paritas: set meta OG/twitter sama persis di index & landing', () => {
    const names = (h) =>
      (h.match(/<meta (?:property|name)="([^"]+)"/g) ?? [])
        .map((m) => m.match(/"([^"]+)"/)[1])
        .sort();
    expect(names(app)).toEqual(names(lnd));
  });

  it('dist ter-build memuat og:image:type di kedua halaman (bila ada)', () => {
    if (existsSync(distApp)) {
      expect(readFileSync(distApp, 'utf8')).toMatch(/og:image:type" content="image\/png"/);
    }
    if (existsSync(distLnd)) {
      expect(readFileSync(distLnd, 'utf8')).toMatch(/og:image:type" content="image\/png"/);
    }
  });
});
