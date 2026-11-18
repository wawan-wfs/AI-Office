import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const read = (p) => readFileSync(p, 'utf8');

describe('Siklus 624: link manifest paritas index vs landing', () => {
  const index = read('index.html');
  const landing = read('public/landing.html');
  const distIndex = readFileSync('dist/index.html', 'utf8');
  const distLanding = readFileSync('dist/landing.html', 'utf8');
  const re = (src) => src.match(/<link rel="manifest" href="\/manifest\.webmanifest"\s*\/?>/g);

  it('index.html belum punya link manifest manual (vite-plugin-pwa inject di dist)', () => {
    expect(re(index)).toBeNull();
    expect(distIndex.match(/<link rel="manifest"[^>]*>/g)).toHaveLength(1);
  });

  it('landing.html sudah punya link manifest persis di head', () => {
    expect(re(landing)).toHaveLength(1);
  });

  it('dist/landing.html tidak ter-inject manifest duplikat', () => {
    expect(distLanding.match(/<link rel="manifest"[^>]*>/g)).toHaveLength(1);
  });
});
