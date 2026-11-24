// Spesifikasi poster dinding kantor WFS Project (data murni, tanpa THREE/canvas).
// Dipakai furniture.js untuk render; diuji agar posisi/teks/warna tak regresi.
// Siklus 448: warna delegasi ke ui_palette.js (blok PS_*) — 0 literal hex di sini.
import {
  PS_SHIP, PS_KUALITAS, PS_BUILD, PS_TEST, PS_WFS,
  PS_FOKUS, PS_SELESAIKAN, PS_ANTAR,
} from '../../lib/ui_palette.js';

export const POSTER_Y = 2.2;
export const POSTER_W = 0.46;
export const POSTER_H = 0.66;
export const CANVAS_W = 120;
export const CANVAS_H = 160;
export const LINE_H = 24; // jarak antar baris teks pada canvas

export const POSTERS = [
  { x: -11.4, z: -2, c: PS_SHIP, t: 'SHIP IT' },
  { x: -11.4, z: 3, c: PS_KUALITAS, t: 'KUALITAS DULU' },
  { x: -11.4, z: 6, c: PS_BUILD, t: 'BUILD DAILY' },
  { x: 11.4, z: -2, c: PS_TEST, t: 'TEST EVERYTHING' },
  { x: 11.4, z: 3, c: PS_WFS, t: 'WFS PROJECT' },
  { wall: 'z-', x: 0, z: -9.9, c: PS_FOKUS, t: 'FOKUS' }, // dinding belakang, menghadap kamera
  { wall: 'z+', x: -4, z: 9.9, c: PS_SELESAIKAN, t: 'SELESAIKAN' }, // dinding depan
  { wall: 'z+', x: 4, z: 9.9, c: PS_ANTAR, t: 'ANTAR TEPAT WAKTU' },
];

// Dinding poster: 'z-' = belakang (z negatif), 'z+' = depan (z positif);
// tanpa wall → dinding samping x (perilaku lama dipertahankan).
export function posterWall(p) {
  return p.wall || (p.x < 0 ? 'x-' : 'x+');
}

// Rotasi Y plane agar menghadap ke dalam ruangan dari dindingnya.
export function posterFacingFor(p) {
  const w = posterWall(p);
  if (w === 'z-') return 0; // plane default menghadap +z
  if (w === 'z+') return Math.PI;
  return posterFacing(p.x);
}

// Offset kecil dari dinding agar plane tidak z-fighting dengan frame.
export function posterOffsetFor(p) {
  const w = posterWall(p);
  if (w === 'z-') return 0.03;
  if (w === 'z+') return -0.03;
  return posterOffset(p.x);
}

export function posterFacing(x) {
  return x < 0 ? Math.PI / 2 : -Math.PI / 2;
}

// Offset kecil dari dinding samping agar plane tidak z-fighting dengan frame.
export function posterOffset(x) {
  return x < 0 ? 0.03 : -0.03;
}

// Posisi Y baris teks ke-i pada canvas (baris pertama 64, turun LINE_H per baris).
export function posterLineY(i) {
  return 64 + i * LINE_H;
}
