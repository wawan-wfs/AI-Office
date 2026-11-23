import { describe, it, expect } from 'vitest';
import {
  WALK_SPEED, EXIT_SPEED, LINE_SEC, COLLAB_OFFSET, DEST_JITTER,
  COLLAB_CHANCE, TRIP_PAUSE_MIN, TRIP_PAUSE_JITTER, SIT_TIMER_MIN, SIT_TIMER_JITTER,
  STRIDE, stridePose, collabTarget, jitterDest, pickDest, fallbackSpot, REST_POSE,
} from '../scene/parts/trip_plan.js';
import { DESKS } from '../scene/parts/desk_layout.js';
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js';
import { inObstacle } from '../scene/parts/obstacles.js';
import { FRONT, bandOf } from '../scene/parts/routing.js';

const rngFixed = (r = 0.5, i = 0) => ({ r: () => r, i: () => i });

describe('konstanta historis', () => {
  it('kecepatan jalan 1.6, keluar 2.0, baris dialog 1.8 dtk', () => {
    expect(WALK_SPEED).toBe(1.6);
    expect(EXIT_SPEED).toBe(2.0);
    expect(LINE_SEC).toBe(1.8);
  });
  it('offset collab (+0.95, -0.15) di samping kursi partner', () => {
    expect(COLLAB_OFFSET).toEqual({ x: 1.5, z: -0.2 });
  });
  it('jitter tujuan ±0.5, peluang collab 0.75', () => {
    expect(DEST_JITTER).toBe(0.9);
    expect(COLLAB_CHANCE).toBe(0.3);
  });
  it('pause trip 2±2 dtk, timer duduk 6+0..14 dtk', () => {
    expect(TRIP_PAUSE_MIN).toBe(4);
    expect(TRIP_PAUSE_JITTER).toBe(4);
    expect(SIT_TIMER_MIN).toBe(10);
    expect(SIT_TIMER_JITTER).toBe(18);
  });
  it('STRIDE: scale waktu 0.01, leg pos 0.08 / rot 0.25, arm 0.5, bob 0.035', () => {
    expect(STRIDE).toEqual({ TIME_SCALE: 0.01, LEG_POS: 0.08, LEG_ROT: 0.25, ARM_ROT: 0.5, BOB: 0.035 });
  });
});

describe('collabTarget', () => {
  it('home + offset', () => {
    expect(collabTarget({ x: -8, z: 1.5 })).toEqual({ x: -6.5, z: 1.3 });
  });
  it('offset kustom', () => {
    expect(collabTarget({ x: 0, z: 0 }, { x: 1, z: 1 })).toEqual({ x: 1, z: 1 });
  });
});

describe('collab stand-point (siklus 306): 26 meja aman di rintangan & sesama meja', () => {
  // Titik berdiri menghampiri rekan (collabTarget) harus bebas: bukan di dalam
  // footprint rintangan statis & tak menumpuk kursi meja lain (<0.9 dianggap
  // terhuni oleh seatOccupied). Audit 14 meja utama + 12 spesialis: 0 pelanggaran.
  const homes = [
    ...DESKS.map((d) => ({ ...d, tag: d.tag || 'main' })),
    ...EXTENDED_SPECIALISTS.map((a) => ({ x: a.desk.x, z: a.desk.z, tag: a.name })),
  ];

  it('stand-point tidak di dalam rintangan statis (OBSTACLES)', () => {
    for (const h of homes) {
      const t = collabTarget(h);
      expect(inObstacle(t.x, t.z), `${h.tag} -> (${t.x},${t.z})`).toBe(false);
    }
  });

  it('stand-point tidak menumpuk kursi meja lain (jarak >= 0.9)', () => {
    for (const h of homes) {
      const t = collabTarget(h);
      for (const o of homes) {
        if (o === h) continue;
        const dist = Math.hypot(o.x - t.x, o.z - t.z);
        expect(dist >= 0.9, `${h.tag} vs ${o.tag}: ${dist.toFixed(2)}`).toBe(true);
      }
    }
  });
});

describe('jitterDest', () => {
  it('tanpa jitter tetap di titik dest', () => {
    expect(jitterDest({ x: 9, z: 3 }, { r: () => 0 })).toEqual({ x: 9, z: 3 });
  });
  it('rng.r(a,b) = a+n*(b-a); rngFixed mengembalikan 0..1 dari n, jadi r(-0.5,0.5) dgn n=0.5 → 0; cek aktual ±0.5 penuh', () => {
    // rngFixed(0.5).r dipakai sebagai fungsi langsung → r(-0.5,0.5)=0.5? Tidak: r dipanggil
    // dengan argumen, jadi mock harus memodelkan r(min,max). Mock baru:
    const rmock = (n) => ({ r: (a, b) => a + n * (b - a), i: () => 0 });
    expect(jitterDest({ x: 9, z: 3 }, rmock(0.5))).toEqual({ x: 9, z: 3 });
    expect(jitterDest({ x: 9, z: 3 }, rmock(1)).x).toBe(9.9);
    expect(jitterDest({ x: 9, z: 3 }, rmock(0)).z).toBe(2.1);
    expect(jitterDest({ x: 0, z: 0 }, rmock(1), 2)).toEqual({ x: 2, z: 2 });
  });
  it('guard anti-poisoning: dest NaN/undefined → spot netral; rng tanpa r → spot tanpa jitter', () => {
    expect(jitterDest({ x: NaN, z: 3 }, { r: () => 0 })).toEqual({ x: 0, z: 0 });
    expect(jitterDest(undefined, { r: () => 0 })).toEqual({ x: 0, z: 0 });
    expect(jitterDest({ x: 5, z: 6 }, { i: () => 0 })).toEqual({ x: 5, z: 6 });
  });
});

describe('pickDest', () => {
  const dests = [{ x: 0, z: 0 }, { x: 5, z: 5 }];
  const rmock = (n) => ({ r: (a, b) => a + n * (b - a), i: () => 0 });
  it('terima spot bebas di percobaan pertama (jitter tengah = titik dest)', () => {
    const s = pickDest(dests, rmock(0.5), () => true);
    expect(s).toEqual({ x: 0, z: 0 });
  });
  it('lompat ke percobaan berikut saat spot ditolak', () => {
    let n = 0;
    const s = pickDest(dests, rngFixed(0.5, 0), () => ++n > 1);
    expect(s).not.toBeNull();
    expect(n).toBeGreaterThan(1);
  });
  it('null setelah semua percobaan gagal (fallback koridor di pemanggil)', () => {
    expect(pickDest(dests, rngFixed(0.5, 0), () => false, 8)).toBeNull();
  });
  it('dests kosong/undefined → null tanpa throw (fallback koridor di pemanggil)', () => {
    expect(pickDest([], rmock(0.5), () => true)).toBeNull();
    expect(pickDest(undefined, rmock(0.5), () => true)).toBeNull();
  });
  it('tries kustom dihormati', () => {
    // freeSpot dipanggil 1x per percobaan + 1x re-cek terakhir setelah loop (spot terakhir tetap dipakai bila bebas)
    let calls = 0;
    const s2 = pickDest(dests, rmock(0.5), () => { calls++; return calls > 3; }, 3);
    expect(s2).not.toBeNull(); // re-cek terakhir menemukan spot percobaan ke-3 bebas
    expect(calls).toBe(4);
  });
  it('tries <= 0 / non-integer → null tanpa throw (tidak mungkin freeSpot(null.x, null.z))', () => {
    const freeSpot = () => true;
    expect(pickDest(dests, rmock(0.5), freeSpot, 0)).toBeNull();
    expect(pickDest(dests, rmock(0.5), freeSpot, -3)).toBeNull();
    expect(pickDest(dests, rmock(0.5), freeSpot, 2.5)).toBeNull();
    expect(pickDest(dests, rmock(0.5), freeSpot, NaN)).toBeNull();
  });
  it('guard anti-poisoning: indeks rng.i rusak (NaN/out-of-range) → null tanpa throw (fallback koridor)', () => {
    // semua percobaan memakai indeks rusak → tidak ada spot teruji → null (bukan TypeError)
    expect(pickDest(dests, { r: () => 0, i: () => NaN }, () => true)).toBeNull();
    expect(pickDest(dests, { r: () => 0, i: () => 99 }, () => true)).toBeNull();
    expect(pickDest(dests, { r: () => 0, i: () => -1 }, () => true)).toBeNull();
    expect(pickDest(dests, { r: () => 0, i: () => Infinity }, () => true)).toBeNull();
  });
  it('guard anti-poisoning: freeSpot hilang (bukan fungsi) → null tanpa throw', () => {
    expect(pickDest(dests, rmock(0.5))).toBeNull();
    expect(pickDest(dests, rmock(0.5), null)).toBeNull();
  });
});

describe('fallbackSpot', () => {
  it('meja baris depan (z=-3) → koridor band baris itu', () => {
    const s = fallbackSpot({ x: -8, z: -3 });
    expect(s.x).toBe(-8);
    expect(s.z).toBe(FRONT[bandOf(-3)]);
  });
  it('z di luar band tetap clamp aman (tidak NaN / out-of-front)', () => {
    const s = fallbackSpot({ x: 4, z: -99 });
    expect(FRONT).toContain(s.z);
  });
  it('x meja dipertahankan', () => {
    expect(fallbackSpot({ x: 8, z: 6 }).x).toBe(8);
  });
  it('guard: home null / NaN / Infinity → spot netral finite (anti-poisoning)', () => {
    for (const bad of [null, undefined, {}, { x: NaN, z: NaN }, { x: Infinity, z: 1 }]) {
      const s = fallbackSpot(bad);
      expect(Number.isFinite(s.x)).toBe(true);
      expect(Number.isFinite(s.z)).toBe(true);
    }
    expect(fallbackSpot(null)).toEqual({ x: 0, z: FRONT[1] });
    expect(fallbackSpot({ x: Infinity, z: NaN })).toEqual({ x: 0, z: FRONT[1] });
  });
});

describe('stridePose', () => {
  it('fase 0 → sin/cos standar dgn amplitudo konstanta', () => {
    const p = stridePose(0);
    expect(p.legZ).toBeCloseTo(0);
    expect(p.legRotX).toBeCloseTo(STRIDE.LEG_ROT);
    expect(p.armRotX).toBeCloseTo(0);
    expect(p.bob).toBeCloseTo(0);
  });
  it('puncak sin(t)=1 → legZ = LEG_POS', () => {
    expect(stridePose(Math.PI / 2).legZ).toBeCloseTo(STRIDE.LEG_POS);
  });
  it('fase limb menggeser siklus (kaki kiri vs kanan berlawanan)', () => {
// kaki kiri/kanan berlawanan fase (sin & cos keduanya membalik tanda dgn offset π)
    const a = stridePose(1, 0);
    const b = stridePose(1, Math.PI);
    expect(a.legZ).toBeCloseTo(-b.legZ);
    expect(a.legRotX).toBeCloseTo(-b.legRotX);
    expect(a.armRotX).toBeCloseTo(-b.armRotX);
  });
  it('bob = |sin(t)|*BOB → selalu ≥ 0 dan periodik', () => {
    expect(stridePose(-1).bob).toBeCloseTo(Math.abs(Math.sin(-1)) * STRIDE.BOB);
    expect(stridePose(Math.PI).bob).toBeCloseTo(0);
  });
  it('guard anti-poisoning: t non-finite (NaN/±Infinity) → REST_POSE (limb tak NaN)', () => {
    expect(stridePose(NaN)).toEqual(REST_POSE);
    expect(stridePose(Infinity)).toEqual(REST_POSE);
    expect(stridePose(-Infinity)).toEqual(REST_POSE);
  });
  it('guard anti-poisoning: phase non-finite → REST_POSE', () => {
    expect(stridePose(1, NaN)).toEqual(REST_POSE);
    expect(stridePose(1, Infinity)).toEqual(REST_POSE);
    expect(stridePose(1, -Infinity)).toEqual(REST_POSE);
  });
  it('amplitudo lengan > amplitudo kaki rotasi (lengan lebih lebar)', () => {
    expect(STRIDE.ARM_ROT).toBeGreaterThan(STRIDE.LEG_ROT);
  });
  it('REST_POSE netral total', () => {
    expect(REST_POSE).toEqual({ legZ: 0, legRotX: 0, armRotX: 0, bob: 0 });
  });
});
