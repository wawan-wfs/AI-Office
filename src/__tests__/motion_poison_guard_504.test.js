import { describe, it, expect } from 'vitest';
import { dist2, stepMove } from '../scene/parts/motion_math.js';
import { collabTarget, COLLAB_OFFSET } from '../scene/parts/trip_plan.js';

describe('Siklus 504: dist2 anti-poisoning & fallback distXZ', () => {
  it('input null/undefined/non-object mengembalikan { dx: 0, dz: 0, d: NaN } tanpa melempar TypeError', () => {
    for (const bad of [null, undefined, 'foo', 42, {}]) {
      const r1 = dist2(bad, { x: 1, z: 2 });
      expect(r1).toEqual({ dx: 0, dz: 0, d: NaN });
      expect(Number.isFinite(r1.d)).toBe(false);

      const r2 = dist2({ x: 1, z: 2 }, bad);
      expect(r2).toEqual({ dx: 0, dz: 0, d: NaN });
      expect(Number.isFinite(r2.d)).toBe(false);
    }
    expect(dist2(null, null)).toEqual({ dx: 0, dz: 0, d: NaN });
  });

  it('koordinat non-finite (NaN / ±Infinity) menghasilkan { dx: 0, dz: 0, d: NaN }', () => {
    const badCoords = [
      [{ x: NaN, z: 0 }, { x: 3, z: 4 }],
      [{ x: 0, z: Infinity }, { x: 3, z: 4 }],
      [{ x: 0, z: 0 }, { x: -Infinity, z: 4 }],
      [{ x: 0, z: 0 }, { x: 3, z: NaN }],
    ];
    for (const [a, b] of badCoords) {
      const r = dist2(a, b);
      expect(r).toEqual({ dx: 0, dz: 0, d: NaN });
      expect(Number.isFinite(r.d)).toBe(false);
    }
  });

  it('input valid tetap menghasilkan delta & jarak Pythagoras akurat', () => {
    const r = dist2({ x: 1, z: 2 }, { x: 4, z: 6 });
    expect(r).toEqual({ dx: 3, dz: 4, d: 5 });
    expect(dist2({ x: 2, z: -1 }, { x: 2, z: -1 }).d).toBe(0);
  });

  it('string numerik dinormalisasi dgn aman', () => {
    const r = dist2({ x: '0', z: '0' }, { x: '3', z: '4' });
    expect(r).toEqual({ dx: 3, dz: 4, d: 5 });
  });
});

describe('Siklus 504: stepMove anti-poisoning', () => {
  it('pos null/undefined/non-finite mengembalikan posisi netral finite tanpa crash', () => {
    const rNull = stepMove(null, { x: 5, z: 5 }, 2, 0.5);
    expect(rNull).toEqual({ x: 0, z: 0, rot: 0, arrived: true, clamped: false });
    expect(Number.isFinite(rNull.x)).toBe(true);
    expect(Number.isFinite(rNull.z)).toBe(true);

    const rNan = stepMove({ x: NaN, z: 4, rot: 0.8 }, { x: 5, z: 5 }, 2, 0.5);
    expect(rNan).toEqual({ x: 0, z: 0, rot: 0.8, arrived: true, clamped: false });
  });

  it('target null/undefined/non-finite mengembalikan arrived=true dan mempertahankan posisi', () => {
    const pos = { x: 3.5, z: -2.1, rot: 1.4 };
    const rTargetNull = stepMove(pos, null, 2, 0.5);
    expect(rTargetNull).toEqual({ x: 3.5, z: -2.1, rot: 1.4, arrived: true, clamped: false });

    const rTargetNan = stepMove(pos, { x: NaN, z: 0 }, 2, 0.5);
    expect(rTargetNan).toEqual({ x: 3.5, z: -2.1, rot: 1.4, arrived: true, clamped: false });
  });

  it('delta besar dgn target null tidak memicu loop sub-langkah', () => {
    const pos = { x: 1, z: 1, rot: 0 };
    const r = stepMove(pos, null, 2, 100);
    expect(r).toEqual({ x: 1, z: 1, rot: 0, arrived: true, clamped: false });
  });
});

describe('Siklus 504: collabTarget anti-poisoning', () => {
  it('home null/undefined/non-finite mengembalikan spot netral { x: 0, z: 0 }', () => {
    expect(collabTarget(null)).toEqual({ x: 0, z: 0 });
    expect(collabTarget(undefined)).toEqual({ x: 0, z: 0 });
    expect(collabTarget({ x: NaN, z: 2 })).toEqual({ x: 0, z: 0 });
    expect(collabTarget({ x: 1, z: Infinity })).toEqual({ x: 0, z: 0 });
  });

  it('offset null/non-finite fallback ke default COLLAB_OFFSET', () => {
    const home = { x: 2, z: 3 };
    const rNullOff = collabTarget(home, null);
    expect(rNullOff).toEqual({ x: 2 + COLLAB_OFFSET.x, z: 3 + COLLAB_OFFSET.z });

    const rBadOffX = collabTarget(home, { x: NaN, z: 1 });
    expect(rBadOffX).toEqual({ x: 2 + COLLAB_OFFSET.x, z: 4 });
  });

  it('input valid tetap menghasilkan koordinat target partner akurat', () => {
    expect(collabTarget({ x: -8, z: 1.5 })).toEqual({ x: -6.5, z: 1.3 });
    expect(collabTarget({ x: 0, z: 0 }, { x: 1, z: 1 })).toEqual({ x: 1, z: 1 });
  });
});

describe('Siklus 504: integrasi leaving dengan walkTarget invalid', () => {
  it('leaving agent dgn walkTarget null/undefined pulih aman (d=NaN -> arrival selesai)', () => {
    const ad = {
      walker: { position: { x: 5, z: 5 }, visible: true },
      walkTarget: null,
      state: 'leaving',
      home: { x: 0, z: 0, y: 0 },
      label: { position: { set: () => {} }, userData: {} },
    };
    const { d } = dist2(ad.walker.position, ad.walkTarget);
    expect(Number.isFinite(d)).toBe(false);

    // Kontrak leaving di motion.js: if (!Number.isFinite(d) || d < 0.5)
    if (!Number.isFinite(d) || d < 0.5) {
      ad.walker.visible = false;
      ad.state = 'offsite';
    }
    expect(ad.state).toBe('offsite');
    expect(ad.walker.visible).toBe(false);
  });
});
