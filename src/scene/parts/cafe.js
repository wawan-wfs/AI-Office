// Kafe / coffee bar kantor WFS Project (depan kiri): counter L, countertop,
// espresso machine, kettle + cangkir, menu board kanvas, 4 bar stool, snack fridge.
// Builder berbasis konteks (THREE, office, M, MB, drawMenuBoard) — pola sama dgn decor.js.
// Siklus 433: warna bersumber dari palet terpusat (blok CA_*), 0 literal hex.
import { drawMenuBoard } from './sign_canvas.js';
import { uiTexture, uiMaterial } from './ui_colorspace.js';
import {
  CA_COUNTER_WOOD, CA_COUNTERTOP, CA_ESPRESSO_BODY, CA_ESPRESSO_LED, CA_STEAM,
  CA_KETTLE, CA_CUP_RED, CA_CUP_WHITE, CA_MENU_BACK, CA_STOOL_SEAT,
  CA_STOOL_METAL, CA_FRIDGE_BODY, CA_FRIDGE_GLOW,
} from '../../lib/ui_palette.js';

export function createCafe(ctx) {
  const { THREE, office, M, MB, blobMat } = ctx;
  const cafe = new THREE.Group();
  cafe.position.y = 1.20; // Elevasi Lantai 3 (Executive Penthouse / Cafe Deck)
  const CFX = -9.5, CFZ = 7.5;
  // Counter L-shape
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, .95, .6), M(CA_COUNTER_WOOD));
  c1.position.set(CFX, .475, CFZ); c1.castShadow = true; cafe.add(c1);
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(.6, .95, 1.6), M(CA_COUNTER_WOOD));
  c2.position.set(CFX + 1.6, .475, CFZ - 1); c2.castShadow = true; cafe.add(c2);
  if (blobMat) {
    const c1Shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.9), blobMat);
    c1Shadow.rotation.x = -Math.PI / 2;
    c1Shadow.position.set(CFX, 0.012, CFZ);
    c1Shadow.renderOrder = 2;
    c1Shadow.userData.blob = true;
    cafe.add(c1Shadow);

    const c2Shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), blobMat);
    c2Shadow.rotation.x = -Math.PI / 2;
    c2Shadow.position.set(CFX + 1.6, 0.012, CFZ - 1);
    c2Shadow.renderOrder = 2;
    c2Shadow.userData.blob = true;
    cafe.add(c2Shadow);
  }
  // Countertop
  const ct1 = new THREE.Mesh(new THREE.BoxGeometry(3.4, .05, .75), M(CA_COUNTERTOP));
  ct1.position.set(CFX, .975, CFZ); cafe.add(ct1);
  const ct2 = new THREE.Mesh(new THREE.BoxGeometry(.75, .05, 1.75), M(CA_COUNTERTOP));
  ct2.position.set(CFX + 1.6, .975, CFZ - 1); cafe.add(ct2);
  // Espresso machine
  const em = new THREE.Mesh(new THREE.BoxGeometry(.5, .35, .35), M(CA_ESPRESSO_BODY));
  em.position.set(CFX - .8, 1.17, CFZ - .05); cafe.add(em);
  const emG = new THREE.Mesh(new THREE.BoxGeometry(.1, .08, .02), MB(CA_ESPRESSO_LED));
  emG.position.set(CFX - .8, 1.1, CFZ + .13); cafe.add(emG);
  // Uap kopi (siklus 488): 4 kepala uap semi-transparan keluar dari mesin espresso;
  // dianimasikan coffeeSteam() di gate ambient OfficeScene (kontrak waktu-nyata).
  const steam = [];
  for (let i = 0; i < 4; i++) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry(.045 + i * .006, 8, 8),
      new THREE.MeshBasicMaterial({ color: CA_STEAM, transparent: true, opacity: 0, depthWrite: false }));
    sp.position.set(CFX - .8, 1.4 + i * .02, CFZ - .05);
    cafe.add(sp); steam.push(sp);
  }
  // Kettle + cups
  const kt = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .18, 10), M(CA_KETTLE));
  kt.position.set(CFX - .1, 1.09, CFZ); cafe.add(kt);
  const cups = [];
  for (let i = 0; i < 3; i++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .06, 8), M(i === 0 ? CA_CUP_RED : CA_CUP_WHITE));
    cup.position.set(CFX + .5 + i * .22, 1.03, CFZ + .15); cafe.add(cup); cups.push(cup);
    (cup.userData = cup.userData || {}).__cupBasis = 1.03; // siklus 514: basis Y utk cupLift
  }
  // Menu board above counter
  const mbc = document.createElement('canvas'); mbc.width = 256; mbc.height = 140;
  const mbg = mbc.getContext('2d');
  const menuTex = uiTexture(new THREE.CanvasTexture(mbc)); // siklus 518: highlight berganti
  drawMenuBoard(mbg); // gambar awal (tanpa highlight)
  const mb = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .95), uiMaterial(new THREE.MeshBasicMaterial({ map: menuTex })));
  mb.position.set(CFX, 2.3, CFZ + .35); cafe.add(mb);
  const mbB = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, .04), M(CA_MENU_BACK));
  mbB.position.set(CFX, 2.3, CFZ + .32); cafe.add(mbB);
  // Bar stools (oranye, 4 buah di depan counter)
  const stools = [[-1.1], [-.35], [.4], [1.15]].map(([ox]) => {
    const st = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .06, 12), M(CA_STOOL_SEAT));
    seat.position.y = .62; st.add(seat);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .6, 8), M(CA_STOOL_METAL));
    pole.position.y = .3; st.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .03, 12), M(CA_STOOL_METAL));
    base.position.y = .015; st.add(base);
    st.position.set(CFX + ox, 0, CFZ + 1); st.castShadow = true;
    cafe.add(st); return st;
  });
  // Coolbox / snack fridge
  const fr = new THREE.Mesh(new THREE.BoxGeometry(.55, 1.1, .5), M(CA_FRIDGE_BODY));
  fr.position.set(CFX + 2.5, .55, CFZ - .2); fr.castShadow = true; cafe.add(fr);
  if (blobMat) {
    const frShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.7), blobMat);
    frShadow.rotation.x = -Math.PI / 2;
    frShadow.position.set(CFX + 2.5, 0.012, CFZ - 0.2);
    frShadow.renderOrder = 2;
    frShadow.userData.blob = true;
    cafe.add(frShadow);
  }
  const frG = new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .02), MB(CA_FRIDGE_GLOW));
  frG.position.set(CFX + 2.5, .72, CFZ + .06); cafe.add(frG);
  office.add(cafe);
  return { cafe, CFX, CFZ, c1, c2, ct1, ct2, em, emG, steam, kt, cups, menuBoard: mb, menuBoardBack: mbB, menuCtx: mbg, menuTex, stools, fridge: fr, fridgeGlow: frG };
}
