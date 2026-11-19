import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const app = readFileSync(resolve(root, 'index.html'), 'utf8');
const lnd = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const distApp = resolve(root, 'dist/index.html');
const distLnd = resolve(root, 'dist/landing.html');

const twNames = (h) =>
  (h.match(/<meta name="(twitter:[^"]+)"/g) ?? [])
    .map((m) => m.match(/"(twitter:[^"]+)"/)[1])
    .sort();

describe('Siklus 646 — paritas twitter:image dimensi antar halaman', () => {
  it('index.html memuat twitter:image:width/height 1200/630 setelah twitter:image', () => {
    expect(app).toContain('<meta name="twitter:image:width" content="1200" />');
    expect(app).toContain('<meta name="twitter:image:height" content="630" />');
    expect(app.indexOf('name="twitter:image"')).toBeLessThan(app.indexOf('twitter:image:width'));
    expect(app.indexOf('twitter:image:width')).toBeLessThan(app.indexOf('twitter:image:height'));
    expect(app.match(/twitter:image:width/g)).toHaveLength(1);
    expect(app.match(/twitter:image:height/g)).toHaveLength(1);
  });

  it('paritas: set meta twitter sama persis di index & landing', () => {
    expect(twNames(app)).toEqual(twNames(lnd));
  });

  it('dist ter-build memuat twitter:image dimensi di kedua halaman (bila ada)', () => {
    if (existsSync(distApp)) {
      const d = readFileSync(distApp, 'utf8');
      expect(d).toContain('twitter:image:width" content="1200"');
      expect(d).toContain('twitter:image:height" content="630"');
    }
    if (existsSync(distLnd)) {
      expect(readFileSync(distLnd, 'utf8')).toContain('twitter:image:width" content="1200"');
    }
  });
});
