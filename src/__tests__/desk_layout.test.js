import { describe, it, expect } from 'vitest';
import { DESKS, deskColumns, deskRows, deskGrid } from '../scene/parts/desk_layout.js';
import { allAgents } from '../scene/parts/agents_spec.js';

describe('DESKS — layout 14 meja', () => {
  it('tepat 14 meja (satu per agen)', () => {
    expect(DESKS).toHaveLength(14);
    expect(DESKS.length).toBe(allAgents().length);
  });

  it('posisi historis semua 14 meja (urutan agen)', () => {
    const expected = [
      [-8, -3], [-4, -3], [-8, 1.5], [-4, 1.5], [0, -3], [0, 1.5], [-8, 6], [-4, 6],
      [4, -3], [4, 1.5], [4, 6], [13.5, -3], [8, 1.5], [0, 6],
    ];
    DESKS.forEach((d, i) => {
      expect(d.x).toBe(expected[i][0]);
      expect(d.z).toBe(expected[i][1]);
    });
  });

  it('TRAINER AI tak lagi di (8,-3) — sel meja rapat (siklus 296)', () => {
    expect(DESKS[11]).not.toEqual({ x: 8, z: -3 });
    expect(DESKS[11]).toEqual({ x: 13.5, z: -3 });
  });

  it('kolom & baris: baris z tetap [-3,1.5,6]; kolom mengikuti layout (siklus 296: TRAINER AI pindah ke x 13.5)', () => {
    expect(deskRows()).toEqual([-3, 1.5, 6]);
    expect(deskColumns()).toContain(13.5);
  });

  it('tidak ada dua meja menumpuk (posisi unik)', () => {
    const keys = DESKS.map(d => `${d.x},${d.z}`);
    expect(new Set(keys).size).toBe(14);
  });

  it('slot kosong tidak menempati sel meja rapat (8,-3) — siklus 296', () => {
    const g = deskGrid();
    expect(g.empty.some(s => s.x === 8 && s.z === -3)).toBe(true); // sel bebas (di dalam ruang meeting)
    expect(g.empty.some(s => s.x === 8 && s.z === 6)).toBe(true);  // sel resepsionis Founder
  });

  it('semua koordinat finite number', () => {
    for (const d of DESKS) {
      expect(Number.isFinite(d.x)).toBe(true);
      expect(Number.isFinite(d.z)).toBe(true);
    }
  });

  it('meja berada dalam batas ruangan (|x|≤13.5, |z|≤9.5; dinding ±17/±13.5)', () => {
    for (const d of DESKS) {
      expect(Math.abs(d.x)).toBeLessThanOrEqual(13.5);
      expect(Math.abs(d.z)).toBeLessThanOrEqual(9.5);
    }
  });

  it('meja 0 (BANTUIN AI, lead desk) di (−8,−3)', () => {
    expect(DESKS[0]).toEqual({ x: -8, z: -3 });
  });
});

describe('deskColumns / deskRows / deskGrid — injeksi & turunan', () => {
  it('deskColumns default = DESKS-derived', () => {
    expect(deskColumns(DESKS)).toEqual(deskColumns());
  });

  it('injeksi layout kustom: kolom & baris terurut unik', () => {
    const custom = [{ x: 2, z: 5 }, { x: -1, z: 5 }, { x: 2, z: 1 }];
    expect(deskColumns(custom)).toEqual([-1, 2]);
    expect(deskRows(custom)).toEqual([1, 5]);
    const g = deskGrid(custom);
    expect(g.total).toBe(4); // 2 kolom × 2 baris
    expect(g.empty).toHaveLength(1);
  });

  it('grid kosong tidak crash (layout 0 meja)', () => {
    const g = deskGrid([]);
    expect(g.cols).toEqual([]);
    expect(g.rows).toEqual([]);
    expect(g.empty).toEqual([]);
    expect(g.total).toBe(0);
  });

  it('grid penuh (semua slot terisi) → empty []', () => {
    const full = [];
    for (const x of [0, 1]) for (const z of [0, 1]) full.push({ x, z });
    const g = deskGrid(full);
    expect(g.empty).toEqual([]);
    expect(g.total).toBe(4);
  });
});
