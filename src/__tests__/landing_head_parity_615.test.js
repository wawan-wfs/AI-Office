// Siklus 615: paritas head landing.html vs index.html — color-scheme dark
// dan canonical (sebelumnya hanya og:url tanpa link canonical).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, expect } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const landing = readFileSync(path.join(root, 'public/landing.html'), 'utf8');
const index = readFileSync(path.join(root, 'index.html'), 'utf8');

test('landing.html memuat color-scheme dark seperti index.html', () => {
  expect(index).toContain('<meta name="color-scheme" content="dark"');
  expect(landing).toMatch(/<meta name="color-scheme" content="dark"/);
});

test('landing.html memuat canonical menunjuk dirinya sendiri (siklus 645)', () => {
  expect(index).toContain('<link rel="canonical" href="http://161.120.180.21:9503/"');
  expect(landing).toContain('<link rel="canonical" href="http://161.120.180.21:9503/landing.html">');
});

test('tanpa duplikasi color-scheme/canonical di head landing', () => {
  expect((landing.match(/name="color-scheme"/g) || []).length).toBe(1);
  expect((landing.match(/rel="canonical"/g) || []).length).toBe(1);
});
