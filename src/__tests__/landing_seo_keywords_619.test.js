import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(process.cwd());
const idx = readFileSync(resolve(root, 'index.html'), 'utf8');
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');

const metaContent = (html, name) => {
  const m = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`));
  return m ? m[1] : null;
};

describe('landing keywords/author parity (619)', () => {
  it('landing memuat meta keywords identik dgn index.html', () => {
    const kw = metaContent(landing, 'keywords');
    expect(kw).toBeTruthy();
    expect(kw).toBe(metaContent(idx, 'keywords'));
  });

  it('landing memuat meta author identik dgn index.html', () => {
    const a = metaContent(landing, 'author');
    expect(a).toBeTruthy();
    expect(a).toBe(metaContent(idx, 'author'));
  });

  it('keywords menyebut topik produk utama', () => {
    const kw = metaContent(landing, 'keywords');
    for (const t of ['ai software house', 'wfs project', 'multi-agent orchestration']) {
      expect(kw).toContain(t);
    }
  });
});
