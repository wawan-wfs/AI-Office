// Routing koridor & tangga 3 lantai: hindari menembus meja & pastikan lewat tangga nyata saat pindah lantai.
// Baris meja di z=-3 / 1.5 / 6. Koridor depan baris (row-1.15) dan gang antar-baris bebas rintangan.
// Tangga Grand Staircase kembar di x = -2.6 dan x = 2.6 menghubungkan L1<->L2 (z: -1.8 -> -0.6) dan L2<->L3 (z: 3.8 -> 5.0).
import { ZONE_L1_MAX_Z, ZONE_L2_MAX_Z, STAIR1_START_Z, STAIR1_END_Z, STAIR2_START_Z, STAIR2_END_Z } from './floor_elevation.js';
import { DESKS, deskRows } from './desk_layout.js';
import { inObstacle } from './obstacles.js';
export const bandOf = (z) => (z < ZONE_L1_MAX_Z ? 0 : z <= ZONE_L2_MAX_Z ? 1 : 2);

// Baris meja = sumber kebenaran desk_layout.js (satu sumber, siklus 294):
// koridor depan baris (row-1.15) & gang tengah antar-baris (midpoint) diturunkan,
// dulu hardcode [-4.15,0.35,4.85] / [-0.75,3.75] — risiko drift bila layout geser.
export const ROWS = deskRows(DESKS);
export const FRONT = ROWS.map((r) => r - 1.15);
export const GANGS = [0, 1].map((i) => (ROWS[i] + ROWS[i + 1]) / 2)
  .concat(STAIR1_START_Z, STAIR1_END_Z, STAIR2_START_Z, STAIR2_END_Z);

// Tangga Grand Staircase kembar: X = -2.6 (kiri) dan X = 2.6 (kanan)
export const STAIR_X = [-2.6, 2.6];
export const getNearestStairX = (x) => (Math.abs(x - (-2.6)) < Math.abs(x - 2.6) ? -2.6 : 2.6);

export function routePath(a, b) {
  // Guard anti-poisoning: koordinat non-finite (NaN/±Infinity) atau titik asal/tujuan
  // hilang TIDAK boleh menghasilkan waypoint korup (x/z NaN) yang bisa mengirim agen
  // menembus lantai/furnitur — kembalikan jalur kosong (no-op aman), konsisten dgn
  // pola anti-poisoning modul lain (obstacles/floor_elevation/motion_math).
  if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(a.z) ||
      !Number.isFinite(b.x) || !Number.isFinite(b.z)) return [];
  const ba = bandOf(a.z), bb = bandOf(b.z), path = [];
  let originMoved = false;
  if (ba !== bb) {
    // Jalur antar lantai WAJIB melewati tangga arsitektural di X = ±2.6
    const sx1 = getNearestStairX(a.x);
    const sx2 = getNearestStairX(b.x);

    // Siklus 297: titik asal L3 yang dalam (z > 7) tak boleh diagonal langsung ke
    // FRONT[2] — memotong lounge L3 (x 8..12.4 / z 4.3..9.4). Turunkan dulu ke
    // koridor utara z=10 (bebas, elevasi L3 benar), lalu ke koridor depan band.
    if (ba === 2 && a.z > 7 && !segBlocked(a, { x: a.x, z: 10 })) {
      path.push({ x: a.x, z: 10 }, { x: sx1, z: 10 }, { x: sx1, z: FRONT[2] });
      originMoved = true;
    }
    // Siklus 297: bila segmen lurus asal->waypoint pertama menembus rintangan
    // (mis. meja pantry di (3,-8) saat turun dari tangga kanan), geser titik
    // masuk ke gang bebas terdekat dulu — detour vertikal, tanpa menambah
    // jalur baru bila segmen sudah bersih.
    while (path.length && segBlocked(a, path[0])) {
      const w = path[0];
      const detour = detourAround(w, a);
      if (!detour) break; // tak ada gang aman → biarkan (perilaku lama)
      path.unshift(detour);
      if (path.length > 2) break; // batasi: maks 1 titik detour
    }
    // Kasus 1: L1 (0) <-> L2 (1)
    if ((ba === 0 && bb === 1) || (ba === 1 && bb === 0)) {
      const zL1 = STAIR1_START_Z; // kaki tangga di L1
      const zL2 = STAIR1_END_Z;   // kepala tangga di L2
      if (!originMoved) path.push({ x: a.x, z: FRONT[ba] });
      if (ba === 0) {
        // Naik: kaki tangga L1 -> kepala tangga L2
        path.push({ x: sx1, z: FRONT[0] }, { x: sx1, z: zL1 }, { x: sx1, z: zL2 }, { x: b.x, z: FRONT[1] });
      } else {
        // Turun: kepala tangga L2 -> kaki tangga L1
        path.push({ x: sx1, z: FRONT[1] }, { x: sx1, z: zL2 }, { x: sx1, z: zL1 }, { x: b.x, z: FRONT[0] });
      }
    }
    // Kasus 2: L2 (1) <-> L3 (2)
    else if ((ba === 1 && bb === 2) || (ba === 2 && bb === 1)) {
      const zL2 = STAIR2_START_Z; // kaki tangga di L2
      const zL3 = STAIR2_END_Z;   // kepala tangga di L3
      if (!originMoved) path.push({ x: a.x, z: FRONT[ba] });
      if (ba === 1) {
        // Naik: kaki tangga L2 -> kepala tangga L3
        path.push({ x: sx1, z: FRONT[1] }, { x: sx1, z: zL2 }, { x: sx1, z: zL3 }, { x: b.x, z: FRONT[2] });
      } else {
        // Turun: kepala tangga L3 -> kaki tangga L2
        path.push({ x: sx1, z: FRONT[2] }, { x: sx1, z: zL3 }, { x: sx1, z: zL2 }, { x: b.x, z: FRONT[1] });
      }
    }
    // Kasus 3: L1 (0) <-> L3 (2) melintasi dua tangga sekaligus!
    else if ((ba === 0 && bb === 2) || (ba === 2 && bb === 0)) {
      if (!originMoved) path.push({ x: a.x, z: FRONT[ba] });
      if (ba === 0) {
        // L1 -> Stair 1 -> L2 -> Stair 2 -> L3
        path.push(
          { x: sx1, z: FRONT[0] }, { x: sx1, z: STAIR1_START_Z }, { x: sx1, z: STAIR1_END_Z },
          { x: sx1, z: FRONT[1] }
        );
        if (sx1 !== sx2) path.push({ x: sx2, z: FRONT[1] });
        path.push(
          { x: sx2, z: STAIR2_START_Z }, { x: sx2, z: STAIR2_END_Z },
          { x: b.x, z: FRONT[2] }
        );
      } else {
        // L3 -> Stair 2 -> L2 -> Stair 1 -> L1
        path.push(
          { x: sx1, z: FRONT[2] }, { x: sx1, z: STAIR2_END_Z }, { x: sx1, z: STAIR2_START_Z },
          { x: sx1, z: FRONT[1] }
        );
        if (sx1 !== sx2) path.push({ x: sx2, z: FRONT[1] });
        path.push(
          { x: sx2, z: STAIR1_END_Z }, { x: sx2, z: STAIR1_START_Z },
          { x: b.x, z: FRONT[0] }
        );
      }
    }
  } else if (Math.abs(b.x - a.x) > 2.2) {
    // satu band tapi jauh: lewat koridor depan band agar tidak menembus meja rekan
    // Siklus 297: FRONT[2]=4.85 memotong lounge L3 (x 8..12.4 / z 4.3..9.4) —
    // koridor depan band tak selalu bebas. Pilih z koridor yang divisifikasi
    // bersih (segBlocked sampling 0.25 m): FRONT[ba], lalu koridor alternatif.
    const fr = segBlocked(a, { x: b.x, z: FRONT[ba] }) ||
               segBlocked({ x: a.x, z: FRONT[ba] }, b) ||
               frontBlocked(a.x, FRONT[ba]) || frontBlocked(b.x, FRONT[ba])
      ? (altCorridorZ(ba) ?? FRONT[ba])
      : FRONT[ba];
    path.push({ x: a.x, z: fr }, { x: b.x, z: fr });
  }
  // Siklus 297: tujuan L3 yang dalam (z>7) — waypoint koridor (b.x, FRONT[2]=4.85)
  // membuat kaki terakhir menembus lounge L3 (x 8..12.4 / z 4.3..9.4). Ganti
  // ujung jalur ke koridor utara z=10 (bebas, elevasi L3 benar); kaki terakhir
  // (b.x,10)->(b.x,b.z) pendek & bebas.
  if (bb === 2 && b.z > 7 && path.length) {
    const last = path[path.length - 1];
    if (last.z === FRONT[2]) { last.z = 10; last.x = b.x; }
  }
  // Siklus 297: pass "weave" — kaki terakhir koridor→target & diagonal
  // kaki-tangga→target bisa memotong zona furnitur (lounge L3, meja pantry,
  // zona café). Sampling 0.25 m per segmen; titik terblokir → sisipkan titik
  // detour tegak lurus di sisi rintangan terdekat (u→d dan d→v wajib bersih).
  // Siklus 298: pass "simplify" — waypoint tengah redundan dihapus bila segmen
  // langsung ke waypoint berikutnya bebas rintangan (greedy farthest-reachable).
  // Waypoint pertama & terakhir dijaga (kontrak tes: ujung koridor utara & target).
  // Siklus 298: pass "simplify" hanya untuk rute SATU band — jalur antar lantai
  // wajib mempertahankan waypoint tangga eksplisit (agen harus benar2 naik tangga,
  // segmen lurus yang "bebas rintangan" tetap mid-air bila memotong elevasi).
  const w = weave(path, a, b);
  return ba === bb ? simplify(w) : w;
}

function simplify(path) {
  if (path.length < 3) return path;
  const first = path[0], last = path[path.length - 1];
  const mids = path.slice(1, -1);
  const out = [first];
  let cur = first;
  let i = 0;
  while (i < mids.length) {
    let j = i;
    for (let k = mids.length; k > i; k--) {
      const cand = k === mids.length ? last : mids[k - 1];
      if (!segBlocked(cur, cand)) { j = k; break; }
    }
    if (j === i) { out.push(mids[i]); cur = mids[i]; i++; }
    else if (j === mids.length) { cur = last; break; }
    else { out.push(mids[j - 1]); cur = mids[j - 1]; i = j; }
  }
  out.push(last);
  return out;
}

function weave(path, a, b) {
  const pts = [...path, b];
  const out = [];
  // Guard anti-duplikat (siklus 300): waypoint nol-panjang berurutan (mis.
  // mid2 == v saat target sudah di koridor utara) dulu lolos — tak fatal
  // (stepMove langsung arrived) tapi limbah jalur & mengotori rute.
  const pushPt = (p) => {
    const last = out[out.length - 1];
    if (!last || last.x !== p.x || last.z !== p.z) out.push(p);
  };
  let prev = a;
  let inserts = 0;
  // Siklus 301: guard band — titik detour TIDAK boleh berpindah zona lantai
  // (bandOf beda dgn prev). Dulu detourMid/Far bisa menyisipkan titik z
  // melintasi batas zona (mis. -0.59 dari band L1 z<-0.8) saat segmen
  // asal→koridor menyentuh batas; elevasi floorElevationAt lompat diagonal →
  // agen "terbang" mid-air alih-alih lewat tangga. Kandidat yang band-nya
  // beda ditolak (detour dianggap gagal → push v apa adanya).
  const bandOk = (p) => p === undefined || p === null || bandOf(p.z) === bandOf(prev.z);
  for (const v of pts) {
    // Kaki tangga antar band memang wajib melintasi batas zona — jangan pernah
    // di-detour (segmen tangga dirancang bersih; bila terblokir pun push v).
    if (bandOf(prev.z) !== bandOf(v.z)) { pushPt(v); prev = v; continue; }
    if (!segBlocked(prev, v) || inserts >= 8) { pushPt(v); prev = v; continue; }
    let handled = false;
    // Koridor utara L3 (z=10) bila segmen menembus lounge L3: naik ke koridor,
    // seberang, turun — pola 2 titik yang selalu bebas di atas lounge.
    if ((prev.z > 4.3 || v.z > 4.3) && bandOf(prev.z) === bandOf(v.z)) {
      const mid = { x: prev.x, z: 10 };
      // titik turun: x v, geser ke kolom bebas terdekat bila kolom v menembus lounge
      let dx = v.x;
      for (const off of [0, 0.8, 1.6, 2.4, -0.8, -1.6, -2.4, 3.2, -3.2, 4.0, -4.0]) {
        const cand = v.x + off;
        if (Math.abs(cand) <= 16.6 && !inObstacle(cand, v.z) &&
            !segBlocked({ x: cand, z: 10 }, { x: cand, z: v.z })) { dx = cand; break; }
      }
      const mid2 = { x: dx, z: 10 };
      if (!inObstacle(mid.x, mid.z) && !inObstacle(mid2.x, mid2.z) &&
          !segBlocked(prev, mid) && !segBlocked(mid, mid2) && !segBlocked(mid2, v)) {
        pushPt(mid); pushPt(mid2); pushPt(v);
        prev = v; inserts += 2; handled = true;
      }
    }
    if (!handled) {
      const box = detourBox(prev, v);
      if (box && box.every(bandOk)) { pushPt(box[0]); pushPt(box[1]); pushPt(v); prev = v; inserts += 2; handled = true; }
    }
    if (!handled) {
      const det = detourMid(prev, v);
      // Siklus 298 fallback terakhir: rintangan sudut/kontur memanjang (zona café)
      // yang tak bisa dilewati detour 1–2 titik di dekat garis — rute melingkar
      // u→q1→q2→v mengikuti tepi kontur (detourFar), hanya bila detourMid gagal.
      if (det === null && inserts < 8) {
        const far = detourFar(prev, v);
        if (far && far.every(bandOk)) { pushPt(far[0]); pushPt(far[1]); pushPt(v); prev = v; inserts += 2; handled = true; }
      }
      if (!handled) {
        if (det && bandOk(det)) { pushPt(det); inserts++; }
        pushPt(v); prev = v;
      }
    }
  }
  return out;
}

// Detour "kotak" 2 titik: mundur/lanjut sepanjang segmen sampai sebelum &
// sesudah rintangan, lalu geser tegak lurus ke sisi bebas. U→d1→d2→V semuanya
// wajib bersih. Return null bila tak ada sisi yang lolos.
function detourBox(u, v) {
  const dx = v.x - u.x, dz = v.z - u.z;
  const len = Math.hypot(dx, dz) || 1;
  const px = -dz / len, pz = dx / len;
  const n = Math.ceil(len / 0.25) || 1;
  let i0 = -1, i1 = -1;
  for (let i = 1; i <= n; i++) {
    const blocked = inObstacle(u.x + (dx * i) / n, u.z + (dz * i) / n);
    if (blocked && i0 < 0) i0 = i;
    if (blocked) i1 = i;
  }
  if (i0 < 0) return null;
  for (const s of [0.7, 1.4, 2.1, 2.8, 3.5, -0.7, -1.4, -2.1, -2.8, -3.5]) {
    const back = Math.max(1, i0 - 2), fwd = Math.min(n, i1 + 2);
    const d1 = { x: u.x + (dx * back) / n + px * s, z: u.z + (dz * back) / n + pz * s };
    const d2 = { x: u.x + (dx * fwd) / n + px * s, z: u.z + (dz * fwd) / n + pz * s };
    if (inObstacle(d1.x, d1.z) || inObstacle(d2.x, d2.z)) continue;
    if (!segBlocked(u, d1) && !segBlocked(d1, d2) && !segBlocked(d2, v)) return [d1, d2];
  }
  return null;
}

// Titik detour di sekitar sampel terblokir segmen u→v: kandidat = geser tegak
// lurus ±0.7..±3.5 m dari titik terblokir. Ambil kandidat bersih yg membuat
// kedua sub-segmen bersih. Return null bila tak ada (perilaku lama).
function detourMid(u, v) {
  const dx = v.x - u.x, dz = v.z - u.z;
  const len = Math.hypot(dx, dz) || 1;
  const px = -dz / len, pz = dx / len; // satuan tegak lurus
  const n = Math.ceil(len / 0.25) || 1;
  for (let i = 1; i <= n; i++) {
    const bx = u.x + (dx * i) / n, bz = u.z + (dz * i) / n;
    if (!inObstacle(bx, bz)) continue;
    for (const s of [0.7, 1.4, 2.1, 2.8, 3.5, -0.7, -1.4, -2.1, -2.8, -3.5]) {
      const c = { x: bx + px * s, z: bz + pz * s };
      if (!inObstacle(c.x, c.z) && !segBlocked(u, c) && !segBlocked(c, v)) return c;
    }
    return null; // berhenti di blok pertama (satu detour per segmen cukup)
  }
  return null;
}

// Fallback "far" (siklus 298): u→q1→q2→v mengikuti tepi kontur rintangan memanjang
// (mis. zona café). q1 = sampel terakhir bersih sebelum blok, digeser pada SUMBU MANA
// PUN (x dan/atau z); q2 = sudut (q1.x, v.z). Semua sub-segmen wajib bersih;
// return null bila tak ada kombinasi yang lolos.
function detourFar(u, v) {
  const dx = v.x - u.x, dz = v.z - u.z;
  const n = Math.ceil(Math.hypot(dx, dz) / 0.25) || 1;
  for (let i = 1; i <= n; i++) {
    if (!inObstacle(u.x + (dx * i) / n, u.z + (dz * i) / n)) continue;
    const back = Math.max(0, i - 2);
    const bx = u.x + (dx * back) / n, bz = u.z + (dz * back) / n;
    for (const off of [0.7, 1.4, 2.1, 2.8, 3.5]) {
      for (const [ox, oz] of [[off, 0], [-off, 0], [0, off], [0, -off], [off, off], [-off, off], [off, -off], [-off, -off]]) {
        const q1 = { x: bx + ox, z: bz + oz };
        const q2 = { x: q1.x, z: v.z };
        if (inObstacle(q1.x, q1.z) || inObstacle(q2.x, q2.z)) continue;
        if (!segBlocked(u, q1) && !segBlocked(q1, q2) && !segBlocked(q2, v)) return [q1, q2];
      }
    }
    return null;
  }
  return null;
}

// Segmen lurus a->b terblokir rintangan? Sampling 0.25 m (cukup halus utk
// footprint terkecil ~0.5 m; konsisten dgn pengujian manual siklus 297).
function segBlocked(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const n = Math.ceil(Math.hypot(dx, dz) / 0.25) || 1;
  for (let i = 1; i <= n; i++) {
    if (inObstacle(a.x + (dx * i) / n, a.z + (dz * i) / n)) return true;
  }
  return false;
}

// Titik detour: titik bebas di sisi rintangan terdekat, sejajar sumbu dominan
// segmen. Return null bila kandidat pertama juga terblokir (jangan paksakan).
function detourAround(w, from) {
  // geser 0.6 m melewati tepi footprint di sekitar w, arah tegak lurus dominan
  const dx = Math.abs(w.x - from.x), dz = Math.abs(w.z - from.z);
  const cands = dx >= dz
    ? [{ x: w.x, z: w.z + 0.7 }, { x: w.x, z: w.z - 0.7 }]
    : [{ x: w.x + 0.7, z: w.z }, { x: w.x - 0.7, z: w.z }];
  for (const c of cands) if (!inObstacle(c.x, c.z)) return c;
  return null;
}

// Z koridor alternatif di band `ba` bila FRONT[ba] memotong zona furnitur:
// band 2 (L3): koridor utara z=10 (bebas rintangan, elevasi L3 benar — midpoint
//   gang (ROWS[1]+ROWS[2])/2=3.75 masih zona L2, bahaya mid-air);
// band 0 (L1): z=-10.5 selatan bebas; band 1 (L2): midpoint gang bebas.
export function freeCorridorZ(ba) {
  const fr = FRONT[ba];
  if (!segBlocked({ x: -17, z: fr }, { x: 17, z: fr })) return fr;
  return altCorridorZ(ba);
}

function altCorridorZ(ba) {
  const cands = ba === 2 ? [10, 12.5]
    : ba === 0 ? [-10.5, (ROWS[0] + ROWS[1]) / 2]
    : [(ROWS[0] + ROWS[1]) / 2, (ROWS[1] + ROWS[2]) / 2];
  for (const c of cands) {
    if (Number.isFinite(c) && !segBlocked({ x: -17, z: c }, { x: 17, z: c })) return c;
  }
  return null;
}

function frontBlocked(x, z) {
  return inObstacle(x, z) || inObstacle(x + 0.3, z) || inObstacle(x - 0.3, z);
}
