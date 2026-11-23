// Footprint rintangan statis (furnitur nyata): tujuan & rute jalan tidak boleh
// berhenti DI DALAM/ATAS benda ini. Diekstrak murni agar bisa di-unit-test.
// Format: [x0, x1, z0, z1].
import { distXZ } from '../../lib/math_util.js';

export const OBSTACLES = [
  [-11.6, -9.5, 2.2, 2.9],    // counter pantry (furniture.js z 2.5, w 1.7)
  [-10.8, -10.2, -0.3, 0.3],  // dispenser air
  [2.5, 3.5, -8.4, -7.5],     // printer L2 (furniture.js x 3, z -8)
  [-11.4, -6.9, 6.2, 9.4],    // zona café: counter L (CFX -9.5), stools z 8.5, fridge (-7, 7.3)
  [8.0, 12.4, 4.3, 9.4],      // lounge: sofa (10.5,6), coffee table, armchairs, lamp, magRack
  [1.25, 4.35, -8.05, -7.15], // server racks L2 (serverroom.js 1.7/2.8/3.9, z -7.6) + kabel tray
  [-11.85, -11.35, -0.25, 0.25], // water cooler (-11.6, 0)
  [6.05, 9.95, -3.85, -2.15], // meja rapat L1 (meeting_room_spec.js CX 8, CZ -3, 3.9×1.55)
  [10.45, 11.95, -9.15, -7.45], // tanaman SE: decor (11.4,-8.6) + furniture (11,-8), radius daun ~0.55
  [-2.55, -1.45, -8.55, -7.45], // tanaman furniture (-2,-8)
  [-11.95, -10.85, 7.45, 9.15], // tanaman barat: decor (-11.4,8.6) + furniture (-11,8) — union dgn zona café
];

// Guard anti-poisoning: koordinat non-finite (NaN/±Infinity) TIDAK boleh dianggap
// "bebas" (return false) — NaN menembus semua perbandingan → agen bisa disuruh
// berhenti/menembus furnitur. Perlakukan sebagai TERBLOKIR (true) = no-op aman,
// konsisten dgn isNearStairX & pola anti-poisoning modul lain.
export const inObstacle = (x, z) =>
  !(Number.isFinite(x) && Number.isFinite(z)) ||
  OBSTACLES.some(([x0, x1, z0, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1);

// Titik dalam zona meja+kursi agent (±0.9) yang dihuni. agents = agentData
// (entri {agent, home:{x,z}, state}); selfAgent = objek agent pemilik target.
// Koordinat non-finite → dianggap TERHUNI (true), agen tak mencoba duduk di titik korup.
export const seatOccupied = (x, z, agents, selfAgent) =>
  !(Number.isFinite(x) && Number.isFinite(z)) ||
  agents.some((o) => o.agent !== selfAgent && o.state !== 'offsite' &&
    distXZ(o.home, { x, z }) !== null && distXZ(o.home, { x, z }) < 0.9);
