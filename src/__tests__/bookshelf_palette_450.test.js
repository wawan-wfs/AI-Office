import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  BK_FRAME, BK_BOARD,
  BK_BOOK_1, BK_BOOK_2, BK_BOOK_3, BK_BOOK_4,
  BK_BOOK_5, BK_BOOK_6, BK_BOOK_7, BK_BOOK_8,
} from '../lib/ui_palette.js';

const BK = {
  BK_FRAME, BK_BOARD,
  BK_BOOK_1, BK_BOOK_2, BK_BOOK_3, BK_BOOK_4,
  BK_BOOK_5, BK_BOOK_6, BK_BOOK_7, BK_BOOK_8,
};

describe('bookshelf_palette_450 — palet rak buku satu sumber', () => {
  it('nilai terkunci historis (10 konstanta BK_*)', () => {
    expect(BK).toEqual({
      BK_FRAME: 0x5D4037,
      BK_BOARD: 0x8D6E63,
      BK_BOOK_1: 0xEF5350,
      BK_BOOK_2: 0xFFCA28,
      BK_BOOK_3: 0x42A5F5,
      BK_BOOK_4: 0x66BB6A,
      BK_BOOK_5: 0xAB47BC,
      BK_BOOK_6: 0xFF7043,
      BK_BOOK_7: 0x26C6DA,
      BK_BOOK_8: 0xEC407A,
    });
  });

  it('anti-poisoning: nilai harus number 24-bit', () => {
    for (const [k, v] of Object.entries(BK)) {
      expect(typeof v, k).toBe('number');
      expect(Number.isInteger(v), k).toBe(true);
      expect(v, k).toBeGreaterThanOrEqual(0);
      expect(v, k).toBeLessThanOrEqual(0xffffff);
    }
  });

  it('pemakaian di titik asal: bookCols & M() delegasi ke konstanta BK_*', async () => {
    const src = readFileSync(new URL('../scene/parts/bookshelf.js', import.meta.url), 'utf8');
    for (const name of Object.keys(BK)) {
      expect(src, name).toContain(name);
    }
    expect(src).toMatch(/bookCols\s*=\s*\[BK_BOOK_1[^\]]*BK_BOOK_8\]/);
    expect(src).toContain('M(BK_FRAME)');
    expect(src).toContain('M(BK_BOARD)');
  });

  it('bookshelf.js bebas literal hex', () => {
    const src = readFileSync(new URL('../scene/parts/bookshelf.js', import.meta.url), 'utf8');
    expect(src.match(/0x[0-9a-fA-F]{6}\b/g) ?? []).toHaveLength(0);
  });
});
