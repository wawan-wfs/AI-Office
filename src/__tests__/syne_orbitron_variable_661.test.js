import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const css = readFileSync(resolve(root, 'public/fonts/fonts.css'), 'utf8');

const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
const fam = (b) => (b.match(/font-family:\s*'([^']+)'/) || [])[1];

it('fonts.css kini 12 blok @font-face setelah variable Syne/Orbitron', () => {
  expect(blocks.length).toBe(12);
});

it('Orbitron: tepat 1 face variable 400 900, tanpa face statis 400-700', () => {
  const orb = blocks.filter((b) => fam(b) === 'Orbitron');
  expect(orb.length).toBe(1);
  expect(orb[0]).toContain('font-weight: 400 900');
  expect(css).not.toMatch(/font-family:\s*'Orbitron'[\s\S]*?font-weight:\s*(400|500|600|700);/);
});

it('Syne: tepat 3 face variable 400 800 (greek/latin-ext/latin), tanpa face statis 400/600/700/800', () => {
  const syn = blocks.filter((b) => fam(b) === 'Syne');
  expect(syn.length).toBe(3);
  for (const b of syn) {
    expect(b).toContain('font-weight: 400 800');
    expect(b).toMatch(/8vIH7w4qzmVxm2/);
  }
  expect(css).not.toMatch(/font-family:\s*'Syne'[\s\S]*?font-weight:\s*(400|600|700|800);/);
});

it('dist ter-build berisi face variable yang sama (paritas)', () => {
  let dist = '';
  try {
    dist = readFileSync(resolve(root, 'dist/fonts/fonts.css'), 'utf8');
  } catch {
    return; // dist belum dibangun di lingkungan CI murni
  }
  expect(dist.match(/font-weight: 400 900/g)?.length).toBe(1);
  expect(dist.match(/font-weight: 400 800/g)?.length).toBe(3);
  expect(dist.match(/@font-face/g)?.length).toBe(12);
});
