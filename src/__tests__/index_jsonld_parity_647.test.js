// Siklus 647: JSON-LD WebSite structured data paritas di index.html (app shell kanonik /)
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
const landingHtml = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const distIndex = resolve(root, 'dist/index.html');

function extractWebSiteJsonLd(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data && data['@type'] === 'WebSite') return data;
    } catch {
      // lanjut cari blok berikutnya
    }
  }
  return null;
}

describe('Siklus 647 — JSON-LD WebSite structured data paritas di index.html', () => {
  it('index.html memuat satu blok ld+json WebSite Schema.org yang valid', () => {
    const data = extractWebSiteJsonLd(indexHtml);
    expect(data).not.toBeNull();
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('WFS Project HQ');
    expect(data.url).toBe('http://161.120.180.21:9503/');
    expect(data.inLanguage).toBe('id');
    expect(data.description).toContain('tim agen AI');
  });

  it('paritas WebSite: properti inti identik antara index.html dan landing.html', () => {
    const dataIndex = extractWebSiteJsonLd(indexHtml);
    const dataLanding = extractWebSiteJsonLd(landingHtml);
    expect(dataIndex).not.toBeNull();
    expect(dataLanding).not.toBeNull();

    expect(dataIndex['@context']).toBe(dataLanding['@context']);
    expect(dataIndex['@type']).toBe(dataLanding['@type']);
    expect(dataIndex.name).toBe(dataLanding.name);
    expect(dataIndex.url).toBe(dataLanding.url);
    expect(dataIndex.description).toBe(dataLanding.description);
    expect(dataIndex.inLanguage).toBe(dataLanding.inLanguage);
    expect(dataIndex.publisher).toEqual(dataLanding.publisher);
    expect(dataIndex.potentialAction).toEqual(dataLanding.potentialAction);
  });

  it('dist ter-build memuat blok ld+json WebSite yang valid', () => {
    if (existsSync(distIndex)) {
      const distData = extractWebSiteJsonLd(readFileSync(distIndex, 'utf8'));
      expect(distData).not.toBeNull();
      expect(distData['@type']).toBe('WebSite');
      expect(distData.name).toBe('WFS Project HQ');
    }
  });
});
