// Kanvas tanda dekoratif (diekstrak dari OfficeScene, murni — tanpa THREE/DOM):
//  - drawMenuBoard(ctx)      : papan menu WFS CAFÉ (256×140)
//  - drawPoster(ctx, txt, col): poster motivasi (256×340), txt boleh multi-baris '\n'
//  - drawWelcomeSign(ctx)    : papan sambutan dinding kiri (1024×320)
// Urutan & parameter perintah gambar identik kode inline lama di OfficeScene.
// Siklus 447: warna delegasi ke blok SG_* di ui_palette.js (satu sumber).

import { SG_MENU_BG, SG_MENU_HI, SG_MENU_TEXT, SG_POSTER_BG, LC_BG, LC_FRAME, LC_GRAD_A, LC_TEXT, AMBER_ACCENT } from '../../lib/ui_palette.js';

export function drawMenuBoard(c, highlightIdx = -1) {
  // Siklus 518: baris menu ter-highlight (indeks 0…2, default -1 = tak ada)
  // digambar lebih terang — berganti tiap MENU_HIGHLIGHT_SEC via menuHighlight().
  const hi = Number.isInteger(highlightIdx) && highlightIdx >= 0 && highlightIdx < 3 ? highlightIdx : -1;
  c.fillStyle = SG_MENU_BG; c.fillRect(0, 0, 256, 140);
  c.strokeStyle = AMBER_ACCENT; c.lineWidth = 6; c.strokeRect(3, 3, 250, 134);
  c.font = 'bold 26px sans-serif'; c.fillStyle = AMBER_ACCENT; c.fillText('WFS CAFÉ', 34, 40);
  c.font = '15px monospace';
  const rows = [
    ['Kopi susu      15k', 75],
    ['Americano     18k', 100],
    ['Matcha latte  22k', 125],
  ];
  rows.forEach(([txt, y], i) => {
    c.fillStyle = i === hi ? SG_MENU_HI : SG_MENU_TEXT; // highlight kuning hangat vs putih
    c.fillText(txt, 26, y);
  });
}

export function drawPoster(p, txt, col) {
  p.fillStyle = SG_POSTER_BG; p.fillRect(0, 0, 256, 340); p.strokeStyle = col; p.lineWidth = 8; p.strokeRect(10, 10, 236, 320);
  p.fillStyle = col; p.font = 'bold 48px sans-serif'; p.textAlign = 'center';
  txt.split('\n').forEach((l, i) => p.fillText(l, 128, 150 + i * 56));
}

// Siklus 519: subjudul berganti bergaya tagline — daftar frasa sambutan
// berputar tiap WELCOME_TAGLINE_SEC dtk (deterministik dari elapsed; judul
// WFS PROJECT tetap). Guard non-finite → frasa pertama.
export const WELCOME_TAGLINE_SEC = 4.4;
const WELCOME_TAGLINES = [
  'Selamat Datang \u00b7 Welcome',
  'Innovation \u00b7 Kolaborasi \u00b7 Karya',
  'AI Office \u00b7 26 Agents On Duty',
];

export function welcomeTaglineIdx(elapsed) {
  if (!Number.isFinite(elapsed)) return 0;
  const n = WELCOME_TAGLINES.length;
  const idx = Math.floor(elapsed / WELCOME_TAGLINE_SEC) % n;
  return ((idx % n) + n) % n; // aman utk elapsed negatif
}

export function drawWelcomeSign(n, taglineIdx = 0) {
  const safeIdx = Number.isInteger(taglineIdx) && taglineIdx >= 0 && taglineIdx < WELCOME_TAGLINES.length
    ? taglineIdx : 0;
  n.fillStyle = LC_BG; n.fillRect(0, 0, 1024, 320);
  n.strokeStyle = LC_FRAME; n.lineWidth = 10; n.strokeRect(10, 10, 1004, 300);
  n.fillStyle = LC_GRAD_A; n.font = '900 130px "Segoe UI",Arial,sans-serif'; n.textAlign = 'center'; n.fillText('WFS PROJECT', 512, 150);
  n.fillStyle = LC_TEXT; n.font = '600 60px "Segoe UI",Arial,sans-serif'; n.fillText(WELCOME_TAGLINES[safeIdx], 512, 250);
}

export function welcomeTaglines() { return WELCOME_TAGLINES.slice(); }
