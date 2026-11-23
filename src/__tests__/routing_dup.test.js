import { describe, it, expect } from 'vitest';
import { routePath } from '../scene/parts/routing.js';
import { CAMPUS_WALK_DESTINATIONS } from '../scene/parts/walk_destinations.js';
import { DESKS } from '../scene/parts/desk_layout.js';

// Siklus 300: guard anti-duplikat waypoint nol-panjang berurutan pada weave.
describe('routing: no zero-length consecutive waypoints', () => {
  it('semua pasangan endpoint (26 meja + 25 campus walk dest) tanpa duplikat berurutan', () => {
    const pts = [...DESKS.map((d) => d.home || { x: d.x, z: d.z }), ...CAMPUS_WALK_DESTINATIONS];
    let routes = 0;
    for (const a of pts) {
      for (const b of pts) {
        if (a === b) continue;
        const p = routePath(a, b);
        routes++;
        for (let i = 0; i < p.length - 1; i++) {
          expect(`${p[i].x},${p[i].z}`).not.toBe(`${p[i + 1].x},${p[i + 1].z}`);
        }
      }
    }
    expect(routes).toBeGreaterThan(1000);
  });

  it('kasus koridor utara L3: target di koridor tak menghasilkan waypoint dobel', () => {
    const p = routePath({ x: -8, z: -3 }, { x: 12, z: 10.5, label: 'L3 East Atrium Walk' });
    expect(p.length).toBeGreaterThan(3);
    for (let i = 0; i < p.length - 1; i++) {
      expect(p[i].x === p[i + 1].x && p[i].z === p[i + 1].z).toBe(false);
    }
  });
});
