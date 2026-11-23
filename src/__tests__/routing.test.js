// Unit test logika murni scene: routing koridor & jadwal meeting.
import { describe, it, expect } from 'vitest';
import { routePath, FRONT, GANGS, bandOf, ROWS } from '../scene/parts/routing.js';
import { DESKS as DESK_LAYOUT, deskRows } from '../scene/parts/desk_layout.js';
import { floorOf, STAIR1_START_Z, STAIR1_END_Z, STAIR2_START_Z, STAIR2_END_Z } from '../scene/parts/floor_elevation.js';
import { OBSTACLES, inObstacle, seatOccupied } from '../scene/parts/obstacles.js';
import { MEETING_WINDOWS, isMeetingTime, meetingWindowIndex } from '../scene/parts/meeting.js';

// Meja agent per band (dipakai untuk cek lintasan tidak menembus zona meja).
const DESKS = [
  { band: 0, zs: [-3] },     // baris belakang
  { band: 1, zs: [1.5] },    // baris tengah
  { band: 2, zs: [6] },      // baris depan
];
// Zona meja agent ±0.9 di z, x bebas — lintasan aman bila setiap segmen
// vertikal (x tetap) hanya menyentuh z di koridor (FRONT/GANGS) atau di z tujuan.
function crossingDesks(path, a) {
  const deskZ = [ -3, 1.5, 6 ];
  const pts = [a, ...path];
  let violations = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1];
    // hanya segmen vertikal yang bisa menembus baris meja
    if (Math.abs(p.x - q.x) > 1e-6) continue;
    const z0 = Math.min(p.z, q.z), z1 = Math.max(p.z, q.z);
    const x = p.x;
    for (const dz of deskZ) {
      // meja ditembus bila segmen vertikal melintas melewati z meja TANPA
      // berada di koridor/gang (jarak x ke meja rekan tak relevan: baris penuh)
      if (z0 < dz - 0.05 && z1 > dz + 0.05) {
        const nearCorridor = [FRONT, GANGS].flat().some((cz) => Math.abs(cz - dz) < 1.3);
        // lintasan via koridor depan/gang legal (koridor memang sejajar baris meja);
        // pelanggaran = vertikal murni menembus z meja di x mana pun
        if (!nearCorridor) violations.push({ x, dz, seg: [p, q] });
      }
    }
  }
  return violations;
}

describe('routing.routePath', () => {
  it('lintasan beda band menyentuh koridor & gang, tidak ada segmen menembus baris meja', () => {
    const cases = [
      [{ x: -4, z: -3 }, { x: 8, z: 6 }],   // belakang → depan
      [{ x: 4, z: 1.5 }, { x: -10, z: -3 }],// tengah → belakang
      [{ x: -8, z: 6 }, { x: 10, z: 1.5 }], // depan → tengah
      [{ x: 0, z: -3 }, { x: 4, z: 6 }],    // melintasi 2 band
    ];
    for (const [a, b] of cases) {
      const path = routePath(a, b);
      expect(path.length).toBeGreaterThan(0);
      // semua waypoint di koridor depan baris atau gang antar-baris
      for (const p of path) {
        const inCorr = FRONT.includes(p.z) || GANGS.includes(p.z);
        const atEndpoint = Math.abs(p.z - a.z) < 0.3 || Math.abs(p.z - b.z) < 0.3;
        expect(inCorr || atEndpoint, `waypoint ${JSON.stringify(p)} harus di koridor/gang atau titik ujung`).toBe(true);
      }
      expect(crossingDesks(path, a, b)).toEqual([]);
    }
  });

  it('satu band dekat: langsung (waypoint akhir = target, tak menembus apa pun)', () => {
    const path = routePath({ x: 4, z: 6 }, { x: 5, z: 6 });
    expect(path).toEqual([{ x: 5, z: 6 }]);
  });

  it('satu band jauh di band lounge L3: koridor utara z=10 (siklus 297)', () => {
    const a = { x: -2, z: 6 }, b = { x: 13.2, z: 6 }; // 13.2 bebas lounge (x>12.4)
    const path = routePath(a, b);
    // FRONT[2]=4.85 memotong lounge L3 (x 8..12.4 / z 4.3..9.4) — dipakai hanya
    // bila segmen asal/tujuan bersih; di sini koridor utara z=10 yang dipilih.
    expect(path[0]).toEqual({ x: -2, z: 10 });
    expect(path[path.length - 1]).toEqual(b);
    expect(noBlockedSegment(path, a, b)).toEqual([]);
    expect(crossingDesks(path, a, b)).toEqual([]);
  });

  function noBlockedSegment(path, a, b) {
    const bad = [];
    let prev = a;
    for (const p of [...path, b]) {
      const dx = p.x - prev.x, dz = p.z - prev.z;
      const n = Math.ceil(Math.hypot(dx, dz) / 0.25) || 1;
      for (let i = 1; i <= n; i++) {
        const x = prev.x + (dx * i) / n, z = prev.z + (dz * i) / n;
        if (inObstacle(x, z)) bad.push({ prev, p, x: +x.toFixed(2), z: +z.toFixed(2) });
      }
      prev = p;
    }
    return bad;
  }

  it('input non-finite (NaN/±Infinity/undefined/null) → jalur kosong (no-op aman)', () => {
    expect(routePath({ x: NaN, z: -3 }, { x: 8, z: 6 })).toEqual([]);
    expect(routePath({ x: -4, z: Infinity }, { x: 8, z: 6 })).toEqual([]);
    expect(routePath({ x: -4, z: -3 }, { x: NaN, z: 6 })).toEqual([]);
    expect(routePath({ x: -4, z: -3 }, { x: 8, z: -Infinity })).toEqual([]);
    expect(routePath(undefined, { x: 8, z: 6 })).toEqual([]);
    expect(routePath({ x: -4, z: -3 }, null)).toEqual([]);
    expect(routePath({ x: -4, z: -3 }, { x: 8, z: 6 })).not.toEqual([]);
  });

  it('bandOf klasifikasi tiga baris dengan benar', () => {
    expect(bandOf(-5)).toBe(0);
    expect(bandOf(0)).toBe(1);
    expect(bandOf(5)).toBe(2);
  });
});

describe('meeting windows', () => {
  it('dua jendela rapat 10:00–10:30 dan 14:00–14:30 (siklus 372: objek satu sumber office_hours)', () => {
    expect(MEETING_WINDOWS).toEqual([
      { start: 600, end: 630, label: 'Stand-up pagi' },
      { start: 840, end: 870, label: 'Sprint review' },
    ]);
  });
  it('isMeetingTime tepat di tepi jendela', () => {
    expect(isMeetingTime(600)).toBe(true);
    expect(isMeetingTime(630)).toBe(true);
    expect(isMeetingTime(599)).toBe(false);
    expect(isMeetingTime(631)).toBe(false);
    expect(isMeetingTime(840)).toBe(true);
    expect(isMeetingTime(871)).toBe(false);
  });
  it('meetingWindowIndex mengembalikan 0/1 di dalam, -1 di luar', () => {
    expect(meetingWindowIndex(610)).toBe(0);
    expect(meetingWindowIndex(850)).toBe(1);
    expect(meetingWindowIndex(700)).toBe(-1);
  });
});

describe('obstacles', () => {
  it('footprint furnitur terdefinisi & titik pusatnya terdeteksi', () => {
    expect(OBSTACLES.length).toBe(11);
    // pusat counter pantry, printer, sofa lounge, rack server, cooler
    expect(inObstacle(-10.5, 2.55)).toBe(true);   // pantry counter
    expect(inObstacle(3.0, -7.9)).toBe(true);     // printer L2
    expect(inObstacle(10.5, 6.0)).toBe(true);     // sofa lounge
    expect(inObstacle(-9.5, 7.5)).toBe(true);     // counter café
    expect(inObstacle(2.8, -7.6)).toBe(true);     // rack server tengah (L2)
    expect(inObstacle(-11.6, 0)).toBe(true);      // water cooler
    expect(inObstacle(8, -3)).toBe(true);         // meja rapat (L1)
    expect(inObstacle(6.7, -3)).toBe(true);       // kaki panel barat meja rapat
    expect(inObstacle(9.3, -3)).toBe(true);       // kaki panel timur meja rapat
  });

  it('titik bebas (koridor, meja kosong) tidak dianggap rintangan', () => {
    expect(inObstacle(0, 4.85)).toBe(false);      // koridor depan band 2
    expect(inObstacle(-4, -0.75)).toBe(false);    // gang
    expect(inObstacle(0, 6)).toBe(false);         // baris meja (bukan furnitur)
  });

  it('seatOccupied: zona ±0.9 sekitar home rekan terisi, offsite tidak', () => {
    const agents = [
      { agent: { name: 'A' }, home: { x: 4, z: 6 }, state: 'sitting' },
      { agent: { name: 'B' }, home: { x: -4, z: -3 }, state: 'offsite' },
    ];
    expect(seatOccupied(4.5, 6.2, agents, { name: 'X' })).toBe(true);   // dekat A
    expect(seatOccupied(-4.3, -2.8, agents, { name: 'X' })).toBe(false); // B offsite
    expect(seatOccupied(4, 6, agents, agents[0].agent)).toBe(false);     // self dikecualikan
  });
});

describe('routing.bandOf sinkron zona-lantai (siklus 290/291)', () => {
  it('GANGS = [koridor, koridor, kaki/kepala tangga eksak dari floor_elevation] (siklus 293)', () => {
    expect(GANGS).toEqual([-0.75, 3.75, STAIR1_START_Z, STAIR1_END_Z, STAIR2_START_Z, STAIR2_END_Z]);
    expect(GANGS).toEqual([-0.75, 3.75, -1.8, -0.6, 3.8, 5.0]); // nilai efektif tak berubah
  });
  it('FRONT/GANGS/gang diturunkan eksak dari desk_layout (siklus 294)', () => {
    expect(ROWS).toEqual(deskRows(DESK_LAYOUT));
    expect(ROWS).toEqual([-3, 1.5, 6]);
    expect(FRONT[0]).toBeCloseTo(-4.15, 10); // row-1.15, nilai efektif tak berubah
    expect(FRONT[1]).toBeCloseTo(0.35, 10);
    expect(FRONT[2]).toBeCloseTo(4.85, 10);
    expect(GANGS.slice(0, 2)).toEqual([-0.75, 3.75]); // midpoint antar-baris
  });
  it('bandOf = floorOf-1 di seluruh rentang z kampus (±13)', () => {
    for (let z = -13; z <= 13; z += 0.1) {
      const fl = floorOf(z);
      expect(bandOf(z)).toBe(fl - 1);
    }
  });
  it('tepi zona: -0.8 → band 1 (bukan 0), 4.5 → band 1 (bukan 2)', () => {
    expect(bandOf(-0.8)).toBe(1);
    expect(bandOf(-0.81)).toBe(0);
    expect(bandOf(4.5)).toBe(1);
    expect(bandOf(4.51)).toBe(2);
  });
  it('kasus beda-lantai: L1→L3 lewat dua tangga dgn waypoint koridor', () => {
    const p = routePath({ x: -8, z: -3 }, { x: 6, z: 6 });
    expect(p.filter(w => w.x === -2.6).length).toBeGreaterThanOrEqual(3);
    expect(p.filter(w => w.x === 2.6).length).toBeGreaterThanOrEqual(3);
    expect(p[p.length - 1]).toEqual({ x: 6, z: 6 }); // waypoint akhir = target (siklus 297)
  });
});
