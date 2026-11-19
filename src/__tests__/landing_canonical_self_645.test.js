import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const dist = join(__dirname, '..', '..', 'dist');
const src = join(__dirname, '..', '..', 'public', 'landing.html');

const BASE = 'http://161.120.180.21:9503';
const APPL = `${BASE}/landing.html`;

// Siklus 651: kebijakan dibalik — landing adalah duplikat konten dari
// kanonik / (robots.txt melarang /landing*), canonical & og:url menunjuk
// / agar crawler tidak memilih URL yang di-disallow.
describe('landing canonical/og:url → / (siklus 651, dibalik dari 645)', () => {
  const CANON = `<link rel="canonical" href="${BASE}/">`;
  const OGURL = `<meta property="og:url" content="${BASE}/">`;
  it('source landing.html: canonical & og:url menunjuk /, bukan diri-sendiri', () => {
    const html = readFileSync(src, 'utf8');
    expect(html).toContain(CANON);
    expect(html).toContain(OGURL);
    expect(html).not.toContain(`<link rel="canonical" href="${APPL}">`);
    expect(html).not.toContain(`<meta property="og:url" content="${APPL}">`);
  });

  it('index.html tetap canonical/og:url = / (tidak terkontaminasi)', () => {
    const html = readFileSync(join(__dirname, '..', '..', 'index.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="${BASE}/" />`);
    expect(html).toContain(`<meta property="og:url" content="${BASE}/" />`);
  });

  it('dist ter-build: landing canonical benar, index canonical tetap /', () => {
    expect(existsSync(join(dist, 'landing.html'))).toBe(true);
    const landing = readFileSync(join(dist, 'landing.html'), 'utf8');
    expect(landing).toContain(CANON);
    expect(landing).toContain(OGURL);
    const index = readFileSync(join(dist, 'index.html'), 'utf8');
    expect(index).toContain(`<link rel="canonical" href="${BASE}/" />`);
  });
});
