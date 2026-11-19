// Guard siklus 627 — stat landing jujur: divisi = 6 (TEAMS), agen bukan klaim "aktif"
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { TEAMS } from '../scene/parts/team_spec.js';

const landing = readFileSync('public/landing.html', 'utf8');

describe('landing stats truth 627', () => {
  it('tidak lagi mengklaim 8+ divisi (realita TEAMS.length)', () => {
    expect(landing).not.toContain('8+');
  });

  it('menampilkan jumlah divisi == TEAMS.length', () => {
    expect(landing).toContain(`<b lang="id">${TEAMS.length}</b><span lang="id">Divisi tim kerja</span>`);
    expect(TEAMS.length).toBe(6);
  });

  it('label agen menyebut kantor 3D, bukan "Agen AI aktif"', () => {
    expect(landing).toContain('Agen di kantor 3D');
    expect(landing).not.toContain('Agen AI aktif');
  });
});
