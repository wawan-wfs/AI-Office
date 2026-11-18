import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const read = (p) => readFileSync(p, 'utf8');
const fontsCss = read('public/fonts/fonts.css');

// Font URL yang benar-benar direferensikan @font-face di fonts.css (selfhost)
const cssFontUrls = new Set([...fontsCss.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map(m => m[1]));

const collectPreloads = (html) => {
  const out = [];
  const re = /<link rel="preload" href="(\/fonts\/[^"]+)" as="font"/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
};

describe('Siklus 618: preload font landing.html valid & paritas dgn index.html', () => {
  const landing = read('public/landing.html');
  const index = read('index.html');

  it('setiap preload font landing ada di @font-face fonts.css (tidak basi)', () => {
    const preloads = collectPreloads(landing);
    expect(preloads.length).toBeGreaterThan(0);
    const indexSelfhost = "/fonts/orbitron-latin.woff2";
    for (const url of preloads) {
      expect(cssFontUrls.has(url) || url === indexSelfhost).toBe(true);
    }
  });

  it('landing tidak lagi preload yMJRMIl (bukan selfhost wajar — Orbitron varian lain)', () => {
    expect(landing).not.toContain('/fonts/yMJRMIlzdpvBhQQL_Qq7dy0.woff2');
  });

  it('preload Orbitron di landing memakai file selfhost yang sama dgn index (orbitron-latin)', () => {
    expect(collectPreloads(landing)).toContain('/fonts/orbitron-latin.woff2');
    expect(collectPreloads(index)).toContain('/fonts/orbitron-latin.woff2');
  });

  it('preload DM Sans di landing == preload DM Sans di index (file latin sama)', () => {
    const lp = collectPreloads(landing).filter(u => u.includes('rP2Yp2y'));
    const ip = collectPreloads(index).filter(u => u.includes('rP2Yp2y'));
    expect(lp).toEqual(ip);
    expect(lp.length).toBe(1);
  });

  it('jumlah preload font landing == index (3)', () => {
    expect(collectPreloads(landing).length).toBe(3);
    expect(collectPreloads(index).length).toBe(3);
  });
});
