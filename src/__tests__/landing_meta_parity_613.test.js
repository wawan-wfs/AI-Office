import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Siklus 613: paritas meta sosial landing.html vs index.html.
// Sebelumnya landing memakai og/twitter:title "WFS PROJECT — Autonomous AI
// Software House" & deskripsi beda redaksi, sementara index.html memakai
// "WFS Project HQ — Kantor AI 3D" (diselaraskan siklus 607) — kartu preview
// WhatsApp/Telegram/X menampilkan judul berbeda tergantung halaman landing.

const root = resolve(process.cwd());
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');

function meta(html, attr, name) {
  const re = new RegExp(`<meta ${attr}="${name}"[^>]*content="([^"]*)"`);
  const m = html.match(re);
  return m ? m[1] : null;
}

const pairs = [
  ['og:title', 'property'],
  ['og:description', 'property'],
  ['twitter:title', 'name'],
  ['twitter:description', 'name'],
  ['og:image', 'property'],
  ['og:image:alt', 'property'],
  ['og:url', 'property'],
];

describe('Siklus 613 — landing.html meta sosial paritas dgn index.html', () => {
  test.each(pairs)('%s identik di landing & index', (name, attr) => {
    const a = meta(landing, attr, name);
    const b = meta(indexHtml, attr, name);
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).toBe(b);
  });

  test('tidak ada lagi judul lama "WFS PROJECT — Autonomous AI Software House" di meta og/twitter landing', () => {
    expect(meta(landing, 'property', 'og:title')).not.toBe('WFS PROJECT — Autonomous AI Software House');
    expect(meta(landing, 'name', 'twitter:title')).not.toBe('WFS PROJECT — Autonomous AI Software House');
  });

  test('deskripsi og/twitter paritas avatar scene — tanpa klaim angka spesifik', () => {
    // Siklus 629: deskripsi tak lagi memuat angka spesifik (26 = avatar scene,
    // bukan jumlah agen task-engine nyata di DB). Angka spesifik di deskripsi
    // berisiko dibaca sebagai jumlah agen produksi (lanjutan siklus 627/628).
    expect(meta(landing, 'property', 'og:description')).not.toMatch(/\b26\b/);
    expect(meta(landing, 'name', 'twitter:description')).not.toMatch(/\b26\b/);
    expect(meta(landing, 'property', 'og:description')).toContain('tim agen AI');
  });
});
