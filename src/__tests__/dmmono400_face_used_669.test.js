import { readFileSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const ROOT = process.cwd();
const css = readFileSync('public/fonts/fonts.css', 'utf8');
const srcCss = readFileSync('src/index.css', 'utf8');
const distCss = (() => {
  const { readdirSync } = require('node:fs');
  const assets = readdirSync('dist/assets').filter((f) => f.startsWith('index-') && f.endsWith('.css'));
  return readFileSync(`dist/assets/${assets[0]}`, 'utf8');
})();

const blocks = css.split('@font-face').slice(1);

function fam(b) {
  const m = b.match(/font-family:\s*'([^']+)'/);
  return m ? m[1] : '';
}
function srcOf(b) {
  const m = b.match(/url\(([^)]+)\)/);
  return m ? m[1].trim() : '';
}

describe('Siklus 669 — face DM Mono 400 Regular terpakai (bukan dead-weight)', () => {
  it('fonts.css punya 2 face DM Mono 400 yang menunjuk file Regular aFTU7PB1*', () => {
    const faces = blocks.filter((b) => fam(b) === 'DM Mono' && /font-weight:\s*400;/.test(b));
    expect(faces.length).toBe(2);
    for (const b of faces) expect(srcOf(b)).toMatch(/aFTU7PB1QTsUX8KYth/);
  });

  it('file woff2 Regular 400 ada di public/fonts dan dist/fonts', () => {
    for (const p of ['public/fonts/aFTU7PB1QTsUX8KYthqQBA.woff2', 'public/fonts/aFTU7PB1QTsUX8KYthSQBLyM.woff2',
                     'dist/fonts/aFTU7PB1QTsUX8KYthqQBA.woff2', 'dist/fonts/aFTU7PB1QTsUX8KYthSQBLyM.woff2']) {
      expect(existsSync(p)).toBe(true);
    }
  });

  it('face 400 benar-benar dipakai: >=10 deklarasi DM Mono tanpa weight eksplisit (default 400)', () => {
    const uses = srcCss.split('\n').filter((l) => l.includes("'DM Mono'")).length;
    expect(uses).toBeGreaterThanOrEqual(10);
    // Semua pemakaian weight eksplisit pada DM Mono harus 500/600/700 (tidak 400 eksplisit ganda)
    const monoRules = srcCss.match(/[^{}]+\{[^}]*'DM Mono'[^}]*\}/g) || [];
    for (const r of monoRules) {
      const w = r.match(/font-weight:\s*(\d+)/);
      if (w) expect(Number(w[1])).toBeGreaterThanOrEqual(500);
    }
  });

  it('fonts.css tepat 9 blok @font-face dan paritas dist', () => {
    expect(blocks.length).toBe(9);
    expect(existsSync('dist/fonts/fonts.css')).toBe(true);
    expect(readFileSync('dist/fonts/fonts.css', 'utf8')).toBe(css);
  });
});
