// Siklus 508 — guard anti-poisoning clip(): field teks non-string (bentuk sah
// API task: title numerik, description objek, tags array) dulu melempar
// TypeError di s.length/s.slice → kartu task & flash log crash. Kontrak lama
// pemangkasan di batas kata + elipsis, string pendek utuh, input kosong → ''.
import { describe, it, expect } from 'vitest';
import { clip, normalizeClipText } from '../lib/clip.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walk(p, acc);
    } else if (/\.(js|jsx)$/.test(name)) {
      acc.push(p);
    }
  }
  return acc;
}

describe('clip — anti-poisoning field non-string', () => {
  it('title numerik → string aman, tidak melempar', () => {
    expect(clip(12345, 10)).toBe('12345');
    expect(clip(0, 5)).toBe('0');
  });

  it('NaN / Infinity → string kosong (bukan "NaN")', () => {
    expect(clip(NaN, 10)).toBe('');
    expect(clip(Infinity, 10)).toBe('');
    expect(clip(-Infinity, 10)).toBe('');
  });

  it('objek & array → JSON, tidak "[object Object]"', () => {
    const o = clip({ a: 1 }, 30);
    expect(o).toContain('"a":1');
    expect(o).not.toContain('[object Object]');
    expect(clip([1, 2, 3], 30)).toBe('[1,2,3]');
  });

  it('objek siklik → aman (string kosong), tidak melempar', () => {
    const cyc = {};
    cyc.self = cyc;
    expect(() => clip(cyc, 10)).not.toThrow();
    expect(clip(cyc, 10)).toBe('');
  });

  it('boolean dinormalisasi, null/undefined tetap ""', () => {
    expect(clip(true, 10)).toBe('true');
    expect(clip(null, 10)).toBe('');
    expect(clip(undefined, 10)).toBe('');
  });

  it('n tidak valid → teks utuh (bukan "…" telanjang)', () => {
    expect(clip('abcdefghij', NaN)).toBe('abcdefghij');
    expect(clip('abcdefghij', 0)).toBe('abcdefghij');
    expect(clip('abcdefghij', -5)).toBe('abcdefghij');
    expect(clip('abcdefghij', undefined)).toBe('abcdefghij');
  });

  it('n numerik-string tetap dipangkas (input form)', () => {
    expect(clip('abcdefghijkl', '5')).toBe('abcde…');
  });
});

describe('clip — kontrak lama dipertahankan', () => {
  it('pemangkasan di batas kata + elipsis', () => {
    expect(clip('a b c d e f g h i j k l', 6)).toBe('a b c…');
    expect(clip('abcdefghijklmnop', 6)).toBe('abcdef…');
    expect(clip('ab  cd  ef', 8)).toBe('ab  cd…');
  });

  it('teks ≤ n utuh tanpa elipsis', () => {
    expect(clip('abcd', 4)).toBe('abcd');
    expect(clip('abc', 10)).toBe('abc');
  });
});

describe('normalizeClipText — satu sumber normalisasi', () => {
  it('string lewat apa adanya (tanpa trim)', () => {
    expect(normalizeClipText('  a  ')).toBe('  a  ');
  });
  it('angka finite & boolean', () => {
    expect(normalizeClipText(7)).toBe('7');
    expect(normalizeClipText(false)).toBe('false');
  });
});

describe('clip — pemanggil nyata tidak lagi menerima TypeError', () => {
  it('tidak ada pemanggil clip() yang memaksa .trim() pada hasil non-string', () => {
    const src = walk(join(process.cwd(), 'src'));
    const offenders = src.filter((f) => {
      if (f.endsWith(join('lib', 'clip.js'))) return false;
      return /clip\([^)]*\)\.(trim|toLowerCase|toUpperCase)\(/.test(readFileSync(f, 'utf8'));
    });
    expect(offenders).toEqual([]);
  });
});
