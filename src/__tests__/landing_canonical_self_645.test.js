import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const dist = join(__dirname, '..', '..', 'dist');
const src = join(__dirname, '..', '..', 'public', 'landing.html');

const BASE = 'http://161.120.180.21:9503';
const APPL = `${BASE}/landing.html`;

describe('landing canonical/og:url self (siklus 645)', () => {
  it('source landing.html: canonical & og:url menunjuk /landing.html, bukan /', () => {
    const html = readFileSync(src, 'utf8');
    expect(html).toContain(`<link rel="canonical" href="${APPL}">`);
    expect(html).toContain(`<meta property="og:url" content="${APPL}">`);
    expect(html).not.toContain(`<link rel="canonical" href="${BASE}/">`);
    expect(html).not.toContain(`<meta property="og:url" content="${BASE}/">`);
  });

  it('index.html tetap canonical/og:url = / (tidak terkontaminasi)', () => {
    const html = readFileSync(join(__dirname, '..', '..', 'index.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="${BASE}/" />`);
    expect(html).toContain(`<meta property="og:url" content="${BASE}/" />`);
  });

  it('dist ter-build: landing canonical benar, index canonical tetap /', () => {
    expect(existsSync(join(dist, 'landing.html'))).toBe(true);
    const landing = readFileSync(join(dist, 'landing.html'), 'utf8');
    expect(landing).toContain(`<link rel="canonical" href="${APPL}">`);
    expect(landing).toContain(`<meta property="og:url" content="${APPL}">`);
    const index = readFileSync(join(dist, 'index.html'), 'utf8');
    expect(index).toContain(`<link rel="canonical" href="${BASE}/" />`);
  });
});
