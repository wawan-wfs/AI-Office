// parts/bookshelf.js — builder murni RAK BUKU (dinding kiri belakang).
// Diekstrak 1:1 dari OfficeScene.js (urutan/posisi/warna identik; tampilan tak berubah).
// Pola sama cafe/serverroom/lounge: konteks di-inject, tanpa dependensi global.
// Siklus 450: warna delegasi ke ui_palette.js (blok BK_*) — 0 literal hex di sini.
import {
  BK_FRAME, BK_BOARD,
  BK_BOOK_1, BK_BOOK_2, BK_BOOK_3, BK_BOOK_4,
  BK_BOOK_5, BK_BOOK_6, BK_BOOK_7, BK_BOOK_8,
} from '../../lib/ui_palette.js';

export function createBookshelf({ THREE, office, M, rng, blobMat }) {
  const shelf = new THREE.Group();
  const SBX = -16.4, SBZ = -6;
  const frameB = new THREE.Mesh(new THREE.BoxGeometry(.5, 2.2, 2.4), M(BK_FRAME));
  frameB.position.set(SBX, 1.1, SBZ); shelf.add(frameB);
  if (blobMat) {
    const bsShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.6), blobMat);
    bsShadow.rotation.x = -Math.PI / 2;
    bsShadow.position.set(SBX, 0.012, SBZ);
    bsShadow.renderOrder = 2;
    bsShadow.userData.blob = true;
    shelf.add(bsShadow);
  }
  const bookCols = [BK_BOOK_1, BK_BOOK_2, BK_BOOK_3, BK_BOOK_4, BK_BOOK_5, BK_BOOK_6, BK_BOOK_7, BK_BOOK_8];
  const books = [];
  for (let lvl = 0; lvl < 4; lvl++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(.48, .03, 2.3), M(BK_BOARD));
    board.position.set(SBX, .35 + lvl * .55, SBZ); shelf.add(board);
    let bz = SBZ - 1.05;
    while (bz < SBZ + 1.0) {
      const bw = .09 + rng.r(0, .07);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(.34, rng.r(.28, .4), bw), M(rng.pick(bookCols)));
      bk.position.set(SBX + .02, .35 + lvl * .55 + .17, bz + bw / 2); shelf.add(bk);
      bk.userData = bk.userData || {}; bk.userData.__book = bk.position.x; // siklus 510: basis X utk bookNudge
      books.push(bk);
      bz += bw + .015;
    }
  }
  office.add(shelf);
  return { shelf, books };
}
