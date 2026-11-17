// Siklus 611 — Guard: wfs-logo.svg mengikuti identitas honeycomb ikon PWA.
//
// Defek riil: public/wfs-logo.svg (logo lockup horizontal di allowlist statis
// :9503) masih memakai desain lama generik — satu heksagon amber dengan 'W'
// besar di dalam ring — tidak konsisten dgn identitas honeycomb yang jadi
// standar sejak siklus 609 (icon-master.svg: 6 sel satelit + hero cell amber
// 'W', bg #000C1E). Logo perlu satu bahasa visual dgn favicon/tab/ikon PWA.
//
// Kontrak:
//  1. wfs-logo.svg memuat 6 poligon sel satelit #22304A + hero cell amber
//     gradien dgn inisial 'W' + background #000C1E (bukan #0F1B2E lama).
//  2. Struktur lockup teks 'WFS' + 'PROJECT' tetap utuh (logo = lockup).
//  3. Struktur 6-satelit konsisten dgn icon-master.svg (siklus 609).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(here, '..', '..');
const logo = readFileSync(join(ROOT, 'public', 'wfs-logo.svg'), 'utf8');
const master = readFileSync(join(ROOT, 'public', 'icon-master.svg'), 'utf8');

const countSatellites = (svg) => satellitePolys(svg) || (svg.match(/fill="#22304A"/g) || []).length;
const satellitePolys = (svg) => {
  const block = svg.match(/<g fill="#22304A">([\s\S]*?)<\/g>/);
  return block ? (block[1].match(/<polygon/g) || []).length : 0;
};

describe('siklus 611 — wfs-logo.svg identitas honeycomb', () => {
  it('memuat 6 sel satelit #22304A + hero cell amber gradien + W', () => {
    expect(countSatellites(logo)).toBe(6);
    expect((logo.match(/fill="#22304A"/g) || []).length).toBeGreaterThanOrEqual(1);
    expect(logo).toContain('fill="#22304A"');
    expect(logo).toContain('url(#g)');
    expect(logo).toContain('>W</text>');
  });

  it('background #000C1E (theme_color manifest) — bukan #0F1B2E lama', () => {
    expect(logo).toContain('fill="#000C1E"');
    expect(logo).not.toContain('#0F1B2E');
  });

  it('lockup teks WFS + PROJECT tetap utuh', () => {
    expect(logo).toContain('>WFS</text>');
    expect(logo).toContain('>PROJECT</text>');
  });

  it('struktur 6-satelit konsisten dgn icon-master.svg (siklus 609)', () => {
    expect(satellitePolys(master)).toBe(6);
    expect(master).toContain('fill="#000C1E"');
    expect(master).toContain('url(#g)');
  });
});
