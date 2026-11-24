// Perabot kantor WFS Project — ditulis ulang dengan pola "builder" berbasis data.
// Setiap builder menerima konteks { THREE, office, M, MB, rng } dan mengembalikan referensi yang dibutuhkan scene.
import { floorElevationAt } from './floor_elevation.js';
import { POSTERS, POSTER_Y, POSTER_W, POSTER_H, CANVAS_W, CANVAS_H, posterOffsetFor, posterFacingFor } from './poster_spec.js';
import { drawPoster } from './poster_canvas.js';
import { uiTexture, uiMaterial } from './ui_colorspace.js';
import {
  AMEN_DISP_BODY, AMEN_DISP_BOTTLE, AMEN_DISP_TAP, AMEN_POT_BASE, AMEN_LEAF_A, AMEN_LEAF_B,
  AMEN_SHELF, AMEN_BOOK_SPINES, AMEN_PRINT_BODY, AMEN_PRINT_MID, AMEN_PRINT_TOP,
  AMEN_PRINT_PAPER, AMEN_PRINT_DARK, AMEN_PRINT_LED, AMEN_PRINT_SHEET, AMEN_SOFA_DARK,
  AMEN_SOFA_CUSHION, AMEN_SOFA_TRAY, AMEN_SOFA_LEG, AMEN_MAG_RED, AMEN_MAG_BLUE,
  AMEN_PANTRY_BODY, AMEN_PANTRY_TOP, AMEN_KOPI, AMEN_KOPI_DARK, AMEN_KOPI_TRIM,
  AMEN_KOPI_LED, AMEN_CUP, AMEN_JAR, AMEN_PANTRY_BOX, AMEN_MICRO_PANEL, AMEN_POSTER_FRAME,
} from '../../lib/ui_palette.js';

export function createFurniture(ctx /* hooks disiapkan utk ekstensi */) {
  const { THREE, office, M, MB, rng } = ctx;
  const box = (w, h, d, mat, x, y, z, parent = office, cast = false) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (cast) m.castShadow = true;
    parent.add(m);
    return m;
  };

  // ── Dispenser air minum ──
  const dispenser = new THREE.Group();
  box(0.3, 0.6, 0.3, M(AMEN_DISP_BODY), -10.5, 0.3, 0, dispenser);
  box(0.24, 0.28, 0.24, M(AMEN_DISP_BOTTLE), -10.5, 0.74, 0, dispenser);
  box(0.08, 0.06, 0.08, M(AMEN_DISP_TAP), -10.5, 0.5, 0.17, dispenser);
  dispenser.position.y = 0.60; // Lantai 2
  office.add(dispenser);

  // ── Tanaman pot (mengikuti elevasi lantai berundak) ──
  
  const addPlant = (px, pz, big = false) => {
    const k = big ? 1.3 : 1;
    const baseElevation = floorElevationAt(pz);
    box(0.3 * k, 0.24 * k, 0.3 * k, M(AMEN_POT_BASE), px, baseElevation + 0.12 * k, pz, office, true);
    const count = big ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const w = (0.1 + rng.r(0, 0.12)) * k;
      const h = (0.22 + rng.r(0, 0.26)) * k;
      const leaf = box(w, h, 0.1 * k, M(rng.n() > 0.5 ? AMEN_LEAF_A : AMEN_LEAF_B),
        px + rng.r(-0.07, 0.07) * k, baseElevation + 0.3 * k + i * 0.17 * k, pz + rng.r(-0.07, 0.07) * k);
      leaf.rotation.y = rng.r(0, Math.PI);
      leaf.castShadow = true;
    }
  };
  [[-11, 8, true], [-11, -8], [11, -8], [-2, -8], [-6, 8, true]].forEach(([x, z, b]) => addPlant(x, z, b));

  // ── Rak buku rendah (dinding kiri) ──
  const spines = AMEN_BOOK_SPINES;
  for (let row = 0; row < 3; row++) {
    const y = 0.5 + row * 0.55;
    box(1.9, 0.05, 0.32, M(AMEN_SHELF), -11.5, y, -5);
    spines.forEach((c, i) => box(0.13, 0.34 + rng.r(0, 0.16), 0.22, M(c), -12.2 + i * 0.31, y + 0.2, -5));
  }

  // ── Printer/fotokopi ──
  const printer = new THREE.Group();
  box(0.62, 0.5, 0.45, M(AMEN_PRINT_BODY), 3, 0.25, -8, printer);
  box(0.74, 0.46, 0.52, M(AMEN_PRINT_MID), 3, 0.73, -8, printer, true);
  box(0.74, 0.05, 0.54, M(AMEN_PRINT_TOP), 3, 0.98, -8, printer);
  box(0.5, 0.03, 0.34, M(AMEN_PRINT_PAPER), 3, 0.62, -7.7, printer);
  box(0.22, 0.12, 0.02, M(AMEN_PRINT_DARK), 3, 0.78, -7.73, printer);
  const led1 = box(0.04, 0.04, 0.02, MB(AMEN_PRINT_LED), 3.26, 0.78, -7.73, printer);
  if (led1.material && typeof led1.material.clone === 'function') { // siklus 489: LED berkedip via printerCycle
    led1.material = led1.material.clone(); led1.material.transparent = true;
  }
  // Kertas keluar (siklus 489): sheet tipis di tray atas, di-naikkan printerCycle
  const sheet = box(0.5, 0.012, 0.34, new THREE.MeshBasicMaterial({ color: AMEN_PRINT_SHEET, transparent: true, opacity: 0 }), 3, 1.0, -7.7, printer);
  office.add(printer);

  // ── Sofa lounge ──
  const SX = 10.5, SZ = 6;
  const sofa = new THREE.Group();
  box(0.72, 0.36, 2.1, M(AMEN_SOFA_DARK), SX, 0.18, SZ, sofa, true);
  box(0.56, 0.13, 1.9, M(AMEN_SOFA_CUSHION), SX - 0.06, 0.42, SZ, sofa);
  box(0.13, 0.42, 1.9, M(AMEN_SOFA_CUSHION), SX + 0.35, 0.56, SZ, sofa);
  [-1, 1].forEach((s) => box(0.72, 0.26, 0.16, M(AMEN_SOFA_DARK), SX, 0.3, SZ + s * 1.06, sofa));
  box(0.5, 0.045, 1.0, M(AMEN_SOFA_TRAY), SX - 0.72, 0.38, SZ, sofa);
  [[-0.2, -0.42], [-0.2, 0.42], [0.2, -0.42], [0.2, 0.42]].forEach(([dx, dz]) =>
    box(0.045, 0.36, 0.045, M(AMEN_SOFA_LEG), SX - 0.72 + dx, 0.18, SZ + dz, sofa));
  [[AMEN_MAG_RED, -0.15, 0.2], [AMEN_MAG_BLUE, 0.15, -0.15]].forEach(([c, dz, ry]) => {
    const mag = box(0.3, 0.016, 0.22, M(c), SX - 0.72, 0.4, SZ + dz, sofa);
    mag.rotation.y = ry;
    (mag.userData = mag.userData || {}).__magBasis = 0; // siklus 513: basis sudut utk magTilt
  });
  sofa.position.y = 1.20; // Lantai 3
  office.add(sofa);

  // ── Pantry mini (counter + kopi + microwave) ──
  const pantry = new THREE.Group();
  box(1.7, 0.8, 0.5, M(AMEN_PANTRY_BODY), -10.5, 0.4, 2.5, pantry, true);
  box(1.8, 0.045, 0.6, M(AMEN_PANTRY_TOP), -10.5, 0.82, 2.5, pantry);
  box(0.26, 0.36, 0.22, M(AMEN_KOPI), -10.8, 1.02, 2.5, pantry, true);
  box(0.28, 0.03, 0.24, M(AMEN_KOPI_DARK), -10.8, 1.2, 2.5, pantry);
  box(0.15, 0.04, 0.04, M(AMEN_KOPI_TRIM), -10.8, 0.88, 2.42, pantry);
  box(0.03, 0.03, 0.01, MB(AMEN_KOPI_LED), -10.72, 1.1, 2.39, pantry);
  box(0.2, 0.08, 0.2, M(AMEN_CUP), -10.2, 0.88, 2.5, pantry);
  AMEN_JAR.forEach((c) =>
    box(0.045, 0.045, 0.045, M(c), -10.2 + rng.r(-0.06, 0.06), 0.93, 2.5 + rng.r(-0.06, 0.06), pantry));
  box(0.36, 0.22, 0.26, M(AMEN_PANTRY_BOX), -10.5, 0.95, 2.5, pantry);
  box(0.3, 0.18, 0.02, M(AMEN_MICRO_PANEL), -10.5, 0.95, 2.36, pantry);
  pantry.position.y = 0.60; // Lantai 2
  office.add(pantry);

  // ── Poster dinding samping (slogan WFS) — data di parts/poster_spec.js ──
  // Siklus 524: teks poster dinding berganti (wallPosterIdx) — kanvas+tekstur
  // diekspos utk redraw dari OfficeScene (pola posterCanvases decor 522).
  const wallPosterCanvases = [];
  POSTERS.forEach((p) => {
    box(0.04, 0.72, 0.52, M(AMEN_POSTER_FRAME), p.x, POSTER_Y, p.z, office, true);
    const cv = document.createElement('canvas');
    cv.width = CANVAS_W; cv.height = CANVAS_H;
    const g = cv.getContext('2d');
    drawPoster(g, p.c, p.t);
    // siklus 524: tekstur disimpan utk redraw teks berganti (wallPosterIdx)
    const pTex = uiTexture(new THREE.CanvasTexture(cv));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(POSTER_W, POSTER_H), uiMaterial(new THREE.MeshBasicMaterial({ map: pTex, transparent: true })));
    plane.position.set(p.x + posterOffsetFor(p), POSTER_Y, p.z);
    plane.rotation.y = posterFacingFor(p);
    (plane.userData = plane.userData || {}).__poster = true; // siklus 509: napas poster dinding
    wallPosterCanvases.push({ cv, tex: pTex, col: p.c, idx: POSTERS.indexOf(p) }); // siklus 524: redraw teks
    office.add(plane);
  });

  return { addPlant, dispenser, printer, printerFx: { leds: [led1], sheet }, sofa, pantry, wallPosterCanvases };
}
