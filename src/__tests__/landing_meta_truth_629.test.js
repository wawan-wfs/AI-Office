// Siklus 629: klaim angka agen di meta tidak boleh bikin salah paham.
// 26 adalah jumlah avatar kantor 3D (AGENT_ID_SCENE_PAIRS tanpa founder),
// sedangkan agen task-engine nyata di DB hanya 12 (agents_count).
// Siklus 628 sudah mencabut angka dari H1; siklus 629 mencabutnya dari
// meta description / og / twitter / JSON-LD / manifest PWA yang tampil
// di snippet Google dan kartu preview WhatsApp/Telegram/X.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.cwd());
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
const viteCfg = readFileSync(resolve(root, 'vite.config.js'), 'utf8');

const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta ${attr}="${name}"[^>]*content="([^"]*)"`));
  return m ? m[1] : null;
};

const jsonLd = (html) => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
};

describe('landing_meta_truth_629', () => {
  it('meta description halaman kanonik tidak mengklaim jumlah agen spesifik', () => {
    const d = meta(landing, 'name', 'description');
    expect(d).toBeTruthy();
    expect(d).not.toMatch(/\b26\b/);
    expect(d).toContain('tim agen AI');
    // paritas: index.html & landing.html satu snippet untuk satu URL kanonik
    expect(meta(indexHtml, 'name', 'description')).toBe(d);
  });

  it('og/twitter description tanpa angka agen + tetap paritas antar halaman', () => {
    for (const [name, attr] of [['og:description', 'property'], ['twitter:description', 'name']]) {
      const a = meta(landing, attr, name);
      const b = meta(indexHtml, attr, name);
      expect(a).toBeTruthy();
      expect(a).toBe(b);
      expect(a).not.toMatch(/\b26\b/);
    }
  });

  it('JSON-LD & manifest PWA ikut tanpa angka 26 (satu klaim, semua kanal)', () => {
    const data = jsonLd(landing);
    expect(data).not.toBeNull();
    expect(data.description).not.toMatch(/\b26\b/);
    expect(data.description).toContain('tim agen AI');
    const m = viteCfg.match(/manifest:\s*\{[\s\S]*?description:\s*'([^']+)'/);
    expect(m).toBeTruthy();
    expect(m[1]).not.toMatch(/\b26\b/);
    expect(m[1]).toContain('tim agen AI');
  });
});
