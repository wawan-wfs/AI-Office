import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const css = readFileSync(resolve(root, 'public/fonts/fonts.css'), 'utf8');

const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
const fam = (b) => (b.match(/font-family:\s*'([^']+)'/) || [])[1];

// Siklus 662: face Orbitron var yMJRMIl dihapus dari fonts.css (byte-identik dgn
// orbitron-latin.woff2 yang dideklarasikan di src/index.css dgn axis penuh 400 900)
// — tidak ada lagi duplikat @font-face dgn rentang berbeda.
it('fonts.css kini 11 blok @font-face (664: 13 + siklus 666: -2 face DM Mono 300 basi)', () => {
  expect(blocks.length).toBe(11);
  expect(css).not.toContain('yMJRMIlzdpvBhQQL_Qq7dy0.woff2');
});

it('Orbitron: 0 face di fonts.css — deklarasi tunggal di src/index.css (400 900)', () => {
  const orb = blocks.filter((b) => fam(b) === 'Orbitron');
  expect(orb.length).toBe(0);
  const idx = readFileSync(resolve(root, 'src/index.css'), 'utf8');
  expect(idx).toContain("url('/fonts/orbitron-latin.woff2')");
  expect(idx).toContain('font-weight: 400 900');
  expect(idx).not.toMatch(/@font-face\s*\{[^@]*?'Orbitron'[^}]*?font-weight:\s*(400|500|600|700)\s*;/);
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

it('dist ter-build paritas: 11 blok fonts.css + face Orbitron 400 900 di bundle css', () => {
  let dist = '';
  try {
    dist = readFileSync(resolve(root, 'dist/fonts/fonts.css'), 'utf8');
  } catch {
    return; // dist belum dibangun di lingkungan CI murni
  }
  expect(dist.match(/font-weight:\s*400 800/g)?.length).toBe(3);
  expect(dist.match(/@font-face/g)?.length).toBe(11);
  expect(dist).not.toContain('yMJRMIlzdpvBhQQL_Qq7dy0.woff2');
  // Orbitron kini di bundle assets css (dari src/index.css), axis penuh 400 900
  const assets = readdirSync(resolve(root, 'dist/assets')).filter((f) => f.endsWith('.css'));
  const bundle = assets.map((f) => readFileSync(resolve(root, 'dist/assets', f), 'utf8')).join('\n');
  expect(bundle).toMatch(/font-family:Orbitron[^}]*font-weight:400 900/);
});
