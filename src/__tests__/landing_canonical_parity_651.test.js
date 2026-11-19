// Siklus 651 — landing duplikat harus konsisten menunjuk kanonik /
// landing.html & /landing adalah duplikat konten dari kanonik /
// (robots.txt melarang). Canonical diri-sendiri = sinyal duplikat
// bertentangan; crawler bisa memilih URL yang salah (mungkin yang
// di-disallow). Guard: og:url + canonical landing wajib menunjuk /
// dan robots.txt wajib melarang /landing & /landing.html.
import { readFileSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const landing = () => {
  const p = 'public/landing.html';
  if (existsSync(p)) return readFileSync(p, 'utf8');
  return readFileSync('dist/landing.html', 'utf8');
};

describe('landing duplicate canonical parity (651)', () => {
  it('og:url menunjuk kanonik /', () => {
    const m = landing().match(/property="og:url" content="([^"]+)"/);
    expect(m).toBeTruthy();
    expect(m[1]).toBe('http://161.120.180.21:9503/');
  });

  it('canonical menunjuk / (bukan diri-sendiri /landing.html)', () => {
    const m = landing().match(/rel="canonical" href="([^"]+)"/);
    expect(m).toBeTruthy();
    expect(m[1]).toBe('http://161.120.180.21:9503/');
    expect(m[1]).not.toContain('/landing');
  });

  it('robots.txt melarang /landing dan /landing.html', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    expect(robots).toMatch(/^Disallow:\s*\/landing\s*$/m);
    expect(robots).toMatch(/^Disallow:\s*\/landing\.html\s*$/m);
  });
});
