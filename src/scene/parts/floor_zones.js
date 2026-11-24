// Data zona lantai markas — diekstrak murni dari flooring.js agar bisa diuji unit.
// CAFÉ patch menempel kafe fisik (counter L di -9.5,7.5) — dulu di tengah lantai
// menimpa tepi meja SARI/SUPPORT HUMAN; WELCOME & LOUNGE digeser ke sofa lounge asli.
// Siklus 445: warna delegasi ke ui_palette (FZ_*) — satu sumber, nilai identik.
import { FZ_DEV_DESK, FZ_MEETING, FZ_LOUNGE, FZ_CAFE, FZ_SERVER } from '../../lib/ui_palette.js';

export const ZONES = [
  { x: -6, z: -1.2, w: 11, d: 7.5, color: FZ_DEV_DESK, label: 'DEV DESK' },
  { x: 8, z: -3, w: 5.4, d: 5.4, color: FZ_MEETING, label: 'MEETING', op: .9 },
  { x: 8.6, z: 6.85, w: 3.6, d: 4.7, color: FZ_LOUNGE, label: 'WELCOME & LOUNGE' },
  { x: -9.3, z: 8.0, w: 4.4, d: 2.4, color: FZ_CAFE, label: 'CAFÉ' },
  { x: 2.5, z: -8, w: 4, d: 2.6, color: FZ_SERVER, label: 'SERVER ROOM', dy: -0.9 },
];

// Label zona ditempatkan di tepi DEPAN zona (bukan tengah) supaya tidak menumpuk
// name tag agent yang duduk/berdiri di dalam area zona.
export function zoneLabelY(z) {
  return z.z - z.d / 2 + 0.7 + (z.dy || 0);
}

// Skala sprite label: label panjang (>9 karakter) lebih besar.
export function zoneLabelScale(label) {
  return label.length > 9 ? 1.25 : 1;
}
