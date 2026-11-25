import { ROOM_CX, ROOM_CZ, meetingSeats, glassPanels, framePosts } from './meeting_room_spec.js';
import {
  WB_FRAME_W, WB_FRAME_H, WB_FRAME_D,
  WB_BOARD_W, WB_BOARD_H,
  WB_POS_Y, WB_DZ_FRAME, WB_DZ_BOARD,
  WB_TRAY, markerItems,
} from './whiteboard_spec.js';
import { drawSprintBoard } from './whiteboard_canvas.js';
import { drawClockFace } from './clock_canvas.js';
import { uiTexture, uiMaterial } from './ui_colorspace.js';
import { CEIL_PANEL_DAY, CEIL_PANEL_NIGHT, PEND_BULB_DAY, PEND_BULB_NIGHT } from './ceiling_fixtures_palette.js';
import {
  RM_POST, RM_TABLE_TOP, RM_TABLE_LEG, RM_CHAIR_DARK, RM_CHAIR_LEG,
  RM_WB_FRAME, RM_WB_TINT_NIGHT, RM_WB_TINT_DAY, RM_CLOCK_RIM,
  RM_PEND_ROD, RM_PEND_SHADE, RM_PEND_LIGHT,
} from '../../lib/ui_palette.js';

// Ruang meeting, jam dinding, dan pencahayaan gantung — ditulis ulang untuk WFS Project.
export function createMeetingRoom(ctx, glassMat) {
  const { THREE, office, M } = ctx;
  const CX = ROOM_CX, CZ = ROOM_CZ;           // pusat ruangan
  const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); office.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // Kaca pembatas: sisi kiri + dua panel depan dengan celah pintu
  for (const p of glassPanels(CX, CZ)) put(B(p.w, p.h, p.d), glassMat, p.x, p.h / 2, p.z);
  // Tiang rangka
  for (const p of framePosts(CX, CZ)) put(B(0.05, 3.5, 0.05), M(RM_POST), p.x, 1.75, p.z);

  // Meja rapat oval-ish: papan + dua kaki panel
  const top = put(B(3.9, 0.07, 1.55), M(RM_TABLE_TOP), CX, 0.72, CZ);
  top.castShadow = top.receiveShadow = true;
  [-1.55, 1.55].forEach((dx) => put(B(0.08, 0.7, 1.1), M(RM_TABLE_LEG), CX + dx, 0.35, CZ));
  if (ctx.blobMat) {
    const tableShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.8), ctx.blobMat);
    tableShadow.rotation.x = -Math.PI / 2;
    tableShadow.position.set(CX, 0.012, CZ);
    tableShadow.renderOrder = 2;
    tableShadow.userData.blob = true;
    office.add(tableShadow);
  }

  // Kursi (3 per sisi)
  const seats = meetingSeats(CX, CZ);
  seats.forEach((s) => {
    put(B(0.36, 0.045, 0.36), M(RM_CHAIR_DARK), s.x, 0.42, s.z);
    put(B(0.36, 0.34, 0.045), M(RM_CHAIR_DARK), s.x, 0.61, s.z + (s.ry === 0 ? -0.19 : 0.19));
    put(B(0.045, 0.4, 0.045), M(RM_CHAIR_LEG), s.x, 0.2, s.z);
  });

  // Whiteboard dengan agenda sprint — LIVE: data task nyata dari window.__tvData
  // (refresh bersama tvPull, 60 dtk + saat tab visible). Tanpa data → fallback
  // ke agenda statis (drawSprintBoard tanpa T).
  const frame = put(B(WB_FRAME_W, WB_FRAME_H, WB_FRAME_D), M(RM_WB_FRAME), CX, WB_POS_Y, CZ + WB_DZ_FRAME);
  frame.userData.isWhiteboardFrame = true;
  frame.userData.__keep = 1;

  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 128;
  const g = cv.getContext('2d');
  const board = new THREE.Mesh(new THREE.PlaneGeometry(WB_BOARD_W, WB_BOARD_H), uiMaterial(new THREE.MeshBasicMaterial({ map: uiTexture(new THREE.CanvasTexture(cv)) })));
  board.position.set(CX, WB_POS_Y, CZ + WB_DZ_BOARD);
  board.userData.isWhiteboard = true;
  board.userData.__keep = 1;
  office.add(board);

  // Baki spidol & aksesoris di bawah papan tulis rapat
  const tray = put(B(WB_TRAY.w, WB_TRAY.h, WB_TRAY.d), M(WB_TRAY.color), CX, WB_TRAY.y, CZ + WB_TRAY.dz);
  tray.userData.isWhiteboardAccessory = true;
  tray.userData.__keep = 1;

  markerItems(CX, CZ).forEach((m) => {
    const item = put(B(m.w, m.h, m.d), M(m.color), m.x, m.y, m.z);
    item.userData.isWhiteboardAccessory = true;
    item.userData.__keep = 1;
    item.userData.__markerBasis = m.y; // siklus 515: basis tinggi utk markerPick
  });

  let __wbLastData; // siklus 477: basis pembanding tick (referensi tasks terakhir digambar)
  const redraw = () => {
    drawSprintBoard(g, typeof window !== 'undefined' ? window.__tvData?.tasks : undefined);
    board.material.map.needsUpdate = true;
    if (typeof window !== 'undefined') window.__lastWbDrawAt = Date.now();
    __wbLastData = typeof window !== 'undefined' ? window.__tvData?.tasks : undefined; // siklus 477: catat basis tick
  };
  redraw();

  // ── Siklus 167: papan putih ikut meredup malam ──
  // Latar #fbfbfa (MeshBasicMaterial unlit) = seperti panel lampu saat malam —
  // kelas bug 164-166. Warna MATERIAL di-tint (pola skyWins mode neon): redraw
  // live tiap 60 dtk hanya update map (needsUpdate), warna material tak tersentuh
  // → tint selamat dari redraw. Guard idempoten; material tanpa .set (stub) aman.
  const WB_TINT_NIGHT = RM_WB_TINT_NIGHT; // harmonis dgn bingkai jendela FR 0x2B3446
  let boardTintState = null;
  const paintBoardNight = (night) => {
    const c = board && board.material && board.material.color;
    if (!c || typeof c.set !== 'function') return 0;
    if (boardTintState === night) return 0;
    boardTintState = night;
    c.set(night ? WB_TINT_NIGHT : RM_WB_TINT_DAY);
    return 1;
  };
  // Siklus 469: ticker redraw gerbang visibility — dulu wbIv (60 dtk) tetap
  // repaint saat tab hidden; kini tick di-skip saat hidden. Tab kembali visible
  // → redraw langsung via wbOnVis (tak menunggu tick 60 dtk berikutnya).
  // Siklus 477: selain gerbang visibility, tick kini juga hanya menggambar bila
  // referensi window.__tvData.tasks BERUBAH — dulu redraw() jalan tiap 60 dtk
  // walau pull di-skip (backoff kesehatan) sehingga kanvas 320×128 + upload
  // tekstur GPU terpakai utk data identik (paritas drawIfHostChanged papan
  // proyek & onsiteTick lounge). redraw() publik tetap menggambar penuh.
  const wbTick = () => {
    if (document.visibilityState === 'hidden') return;
    const data = typeof window !== 'undefined' ? window.__tvData?.tasks : undefined;
    if (data === __wbLastData) return; // tak ada data baru — repaint tekstur dilewati
    redraw();
  };
  const wbIv = setInterval(wbTick, 60000);
  const wbOnVis = () => { if (document.visibilityState === 'visible') redraw() };
  document.addEventListener('visibilitychange', wbOnVis);

  const destroy = () => {
    clearInterval(wbIv);
    document.removeEventListener('visibilitychange', wbOnVis);
  };

  return {
    MRX: CX,
    MRZ: CZ,
    meetSeats: seats,
    boardRedraw: redraw,
    boardIv: wbIv,
    boardOnVis: wbOnVis,
    boardMesh: board,
    boardFrame: frame,
    paintBoardNight,
    destroy,
  };
}

export function createWallClock(ctx, x, y, z, faceRotY = Math.PI) {
  const { THREE, office, M } = ctx;
  const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96;
  const c = cv.getContext('2d');
  const tex = uiTexture(new THREE.CanvasTexture(cv)); tex.minFilter = THREE.LinearFilter;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24), M(RM_CLOCK_RIM));
  rim.rotation.x = Math.PI / 2; rim.position.set(x, y, z + (faceRotY ? 0.03 : -0.03)); office.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.27, 28), uiMaterial(new THREE.MeshBasicMaterial({ map: tex })));
  face.position.set(x, y, z); face.rotation.y = faceRotY; office.add(face);

  // Siklus 266: draw meneruskan FRAC detik-sim (arg ke-2 = fracSec) ke painter —
  // dulu arg ke-2 adalah timestamp waktu-nyata bawaan painter, membuat jarum
  // detik laju 12× dari menit-sim & tetap berputar saat sim manual beku
  // (fix pipa 265 tak sampai ke painter).
  const draw = (nowSeconds, fracSec = 0) => {
    drawClockFace(c, nowSeconds, fracSec);
    tex.needsUpdate = true;
  };
  return { draw, tex };
}

export function createCeilingFixtures(ctx, deskList) {
  const { THREE, office, M, MB } = ctx;
  const pendBulbs = []; const pendLights = [];
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); office.add(m); return m; };
  // ── Siklus 169: panel plafon recessed & bohlam lampu gantung ikut siang↔malam ──
  // Keduanya MeshBasicMaterial putih hangat (panel 0xF0F4FF n=114 — bidang unlit
  // TERLUAS di audit scene live; bohlam 0xfff3d6 ×26 meja) — dulu statis: jam malam
  // panel dinding/judul sudah gelap (165-168) tapi plafon tetap menyala penuh
  // seperti panel lampu. Pola trim 166: pasangan day/night, MESH ter-tag
  // (userData.__ceil) → warna material AKTIF ikut (aman dari klon wall-fade).
  // Nilai warna kini satu sumber di ceiling_fixtures_palette.js (siklus 417).
  const CEIL_DAY = CEIL_PANEL_DAY;
  const CEIL_NIGHT = CEIL_PANEL_NIGHT;
  const BULB_DAY = PEND_BULB_DAY;
  const BULB_NIGHT = PEND_BULB_NIGHT;
  const nightOf = { [CEIL_DAY]: CEIL_NIGHT, [BULB_DAY]: BULB_NIGHT };
  const dayOf = { [CEIL_NIGHT]: CEIL_DAY, [BULB_NIGHT]: BULB_DAY };
  // Lampu gantung industri di atas tiap meja
  deskList.forEach((d) => {
    put(B(0.02, 0.8, 0.02), M(RM_PEND_ROD), d.x, 3.65, d.z);
    put(B(0.4, 0.14, 0.4), M(RM_PEND_SHADE), d.x, 3.2, d.z);
    const bulb = put(B(0.12, 0.06, 0.12), MB(BULB_DAY), d.x, 3.11, d.z);
    bulb.userData.__ceil = BULB_DAY; // tag pasangan siang → malam
    bulb.userData.__pendBulb = true; // siklus 503: tag napas lampu gantung
    const pl = new THREE.PointLight(RM_PEND_LIGHT, 0.15, 4, 2); pl.position.set(d.x, 3.1, d.z); office.add(pl);
    pl.userData.__pendLight = true; // siklus 503: PointLight ikut bernapas
    pendBulbs.push(bulb); pendLights.push(pl);
  });
  return {
    ceilDay: CEIL_DAY, ceilNight: CEIL_NIGHT, bulbDay: BULB_DAY, bulbNight: BULB_NIGHT,
    pendBulbs, pendLights, // siklus 503: refs napas lampu gantung
    nightOf, dayOf,
    // paintCeilNight — set warna semua mesh ter-tag (panel plafon diregistrasi
    // OfficeScene via registerCeilPanels). Idempoten di sisi pemanggil (daycycle).
    paintCeilNight(night) {
      if (!office || typeof office.traverse !== 'function') return 0;
      const map = night ? nightOf : dayOf;
      let n = 0;
      office.traverse((o) => {
        if (o.isMesh && o.userData && o.userData.__ceil !== undefined && o.material && o.material.color) {
          const day = o.userData.__ceil;
          o.material.color.set(night ? (map[day] !== undefined ? map[day] : day) : day); n++;
        }
      });
      return n;
    },
  };
}
