import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function jsxFiles(dir, acc = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) jsxFiles(p, acc);
    else if (f.name.endsWith('.jsx') && !f.name.includes('.test.')) acc.push(p);
  }
  return acc;
}

describe('Siklus 587: kepatuhan type="button" seluruh <button> di src/', () => {
  it('tidak ada <button> tanpa atribut type eksplisit', () => {
    const offenders = [];
    for (const f of jsxFiles('src')) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/<button\b[^>]*?(?:\/>|>)/gs)) {
        if (!/\btype=/.test(m[0])) offenders.push(`${f}: ${m[0].slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
