// Guard siklus 528: workspace file-browser ShConsole (tab Workspace) — nama file,
// ukuran, isi file viewer, dan dropdown project dinormalisasi; entry bentuk sah
// non-objek / tanpa name dari gateway tak lagi jatuh sebagai React child mentah
// ('[object Object]', "Cannot read properties of null") atau baris kosong.
// Satu sumber normalizer (clip.js), pola seri 512-527.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeClipText } from '../lib/clip.js';

const root = resolve(__dirname, '..', '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

describe('siklus 528 — workspace file-browser satu sumber normalizer', () => {
  it('kontrak normalizeClipText untuk nama file & isi', () => {
    expect(normalizeClipText('a.tsx')).toBe('a.tsx');
    expect(normalizeClipText(4096)).toBe('4096');
    expect(normalizeClipText({ x: 1 })).toBe('{"x":1}');
    expect(normalizeClipText(undefined)).toBe('');
    expect(normalizeClipText(null)).toBe('');
  });

  it('ShConsole: entry file browser di-guard & dinormalisasi, viewer isi file dinormalisasi', () => {
    const src = read('src/components/ShConsole.jsx');
    // guard entry bentuk sah non-objek / tanpa name
    expect(src).toMatch(/typeof en !== 'object' \|\| en === null \|\| !en\.name\) return null/);
    // nama & ukuran dinormalisasi
    expect(src).toMatch(/const nm = normalizeClipText\(en\.name\)/);
    expect(src).toMatch(/normalizeClipText\(en\.size\)\}\{' '\}B/);
    expect(src).not.toMatch(/\{en\.name\}/);
    expect(src).not.toMatch(/\{en\.size\} B/);
    // aria-label & key pakai nm
    expect(src).toMatch(/Folder' : 'File'}: \$\{nm\}/);
    expect(src).toMatch(/<div key=\{nm\}/);
    // file viewer: aria-label + content dinormalisasi
    expect(src).toMatch(/Isi file \$\{normalizeClipText\(fileView\.name\)\}/);
    expect(src).toMatch(/>\{normalizeClipText\(fileView\.content\)\}<\/pre>/);
    // navigasi path "Naik" dinormalisasi
    expect(src).toMatch(/loadWsFiles\(wsId, normalizeClipText\(wsPath\)\.split\('\/'\)/);
  });

  it('ShConsole: dropdown project pakai normalizer (p.name || p.title)', () => {
    const src = read('src/components/ShConsole.jsx');
    expect(src.match(/normalizeClipText\(p\.name \|\| p\.title\)/g).length).toBe(3);
    expect(src).not.toMatch(/\{p\.name\}<\/option>/);
  });
});
