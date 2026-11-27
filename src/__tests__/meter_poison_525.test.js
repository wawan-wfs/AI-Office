// Guard siklus 525: meter host & angka progres terakhir — field numerik API
// (res.load/ram_mb, T.done/total/T[k], S.stats, st[k]) dirender MENTAH sebagai
// React child → objek bentuk sah API menghasilkan "[object Object]" atau crash
// "Objects are not valid as a React child". Satu sumber normalizer (clip.js /
// normalizeSecondary per komponen), pola seri 512-524.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeClipText } from '../lib/clip.js';

const root = resolve(__dirname, '..', '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

describe('siklus 525 — meter host & progres satu sumber normalizer', () => {
  it('kontrak normalizeClipText untuk angka/objek meter', () => {
    expect(normalizeClipText(0.75)).toBe('0.75');
    expect(normalizeClipText(1234)).toBe('1234');
    expect(normalizeClipText(null)).toBe('');
    expect(normalizeClipText({ v: 1 })).toBe('{"v":1}');
    expect(normalizeClipText(NaN)).toBe('');
    const cyclic = {}; cyclic.self = cyclic;
    expect(normalizeClipText(cyclic)).toBe('');
  });

  it('TeamStats & Dashboard: res.load/ram_mb tak lagi child mentah', () => {
    for (const f of ['src/components/TeamStats.jsx', 'src/components/Dashboard.jsx']) {
      const src = read(f);
      expect(src).not.toMatch(/\{res\.load\}/);
      expect(src).not.toMatch(/\{res\.ram_mb\}/);
      expect(src).toMatch(/normalizeSecondary\(res\.load\)/);
      expect(src).toMatch(/normalizeSecondary\(res\.ram_mb\)/);
    }
  });

  it('ProjectPanel: angka progres & stats SaaS dinormalisasi', () => {
    const src = read('src/components/ProjectPanel.jsx');
    expect(src).not.toMatch(/\{T\.done\}\/\{T\.total\}/);
    expect(src).not.toMatch(/\{T\[k\]\}/);
    expect(src).not.toMatch(/\{S\.stats\?\.tenants/);
    expect(src).toMatch(/normalizeClipText\(T\.done\)/);
    expect(src).toMatch(/normalizeClipText\(T\[k\]\)/);
  });

  it('WfsPanel: chip stat agen dinormalisasi', () => {
    const src = read('src/components/WfsPanel.jsx');
    expect(src).not.toMatch(/\{st\[k\] \|\| 0\}/);
    expect(src).toMatch(/normalizeClipText\(st\[k\] \|\| 0\)/);
  });
});
