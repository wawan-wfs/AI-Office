import { describe, it, expect } from 'vitest';
import { routePath, bandOf } from '../scene/parts/routing.js';
import { DESKS } from '../scene/parts/desk_layout.js';
import { CAMPUS_WALK_DESTINATIONS } from '../scene/parts/walk_destinations.js';

// Siklus 301: guard band-crossing — rute antar lantai WAJIB lewat tangga
// vertikal (segmen lintas band hanya boleh bergerak di z sepanjang pita tangga),
// tidak boleh ada detour diagonal yang melompati batas zona (mid-air).
// Ditemukan via probe gabungan 1.482 pasangan endpoint: 18 rute punya segmen
// lintas band diagonal (mis. {2.6,-1.8} → {6.26,-0.59}) akibat pass weave
// menyisipkan detour di band lain; kini guard bandOk di weave.
describe('routing band-crossing — antar lantai lewat tangga vertikal (siklus 301)', () => {
  const endpoints = [
    ...DESKS.map((d) => ({ x: d.x, z: d.z })),
    ...CAMPUS_WALK_DESTINATIONS.map((d) => ({ x: d.x, z: d.z })),
  ];

  it('tidak ada segmen lintas band yang diagonal (hanya vertikal di x tangga)', () => {
    let cross = 0;
    for (const a of endpoints) {
      for (const b of endpoints) {
        if (a === b || bandOf(a.z) === bandOf(b.z)) continue;
        cross++;
        const pts = [a, ...routePath(a, b), b];
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i], q = pts[i + 1];
          if (bandOf(p.z) === bandOf(q.z)) continue;
          // lintas band: x wajib tetap (di pita tangga), z wajib pendek (≤ panjang pita tangga + epsilon)
          expect(Math.abs(q.x - p.x)).toBeLessThanOrEqual(0.05);
          expect(Math.abs(q.z - p.z)).toBeLessThanOrEqual(2.05);
        }
      }
    }
    expect(cross).toBe(1000); // pasangan lintas band tidak berubah (guard cakupan)
  });

  it('kasus regresi eksplisit: meja L2 (0,1.5) → walk dest L1 (11.5,-5.2)', () => {
    const pts = [{ x: 0, z: 1.5 }, ...routePath({ x: 0, z: 1.5 }, { x: 11.85, z: -5.2 }), { x: 11.85, z: -5.2 }];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      if (bandOf(p.z) === bandOf(q.z)) continue;
      expect(q.x).toBe(p.x);
      expect(Math.abs(q.z - p.z)).toBeLessThanOrEqual(2.05);
    }
  });
});
