import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
import { describe, it, expect } from 'vitest';
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');

describe('landing.html PWA meta parity (siklus 616)', () => {
  it('punya apple-mobile-web-app-capable yes', () => {
    expect(landing).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');
  });
  it('punya status-bar-style black-translucent', () => {
    expect(landing).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">');
  });
  it('punya apple-mobile-web-app-title WFS HQ', () => {
    expect(landing).toContain('<meta name="apple-mobile-web-app-title" content="WFS HQ">');
  });
  it('punya mobile-web-app-capable yes', () => {
    expect(landing).toContain('<meta name="mobile-web-app-capable" content="yes">');
  });
  it('viewport menyertai viewport-fit=cover & maximum-scale', () => {
    expect(landing).toMatch(/name="viewport" content="[^"]*viewport-fit=cover[^"]*maximum-scale=5\.0"/);
  });
  it('punya meta robots index, follow', () => {
    expect(landing).toContain('<meta name="robots" content="index, follow">');
  });
  it('tidak ada duplikasi meta PWA', () => {
    expect(landing.match(/apple-mobile-web-app-capable/g).length).toBe(1);
    expect(landing.match(/ name="mobile-web-app-capable"/g).length).toBe(1);
  });
});
