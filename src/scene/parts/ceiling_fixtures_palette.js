// Siklus 417: palet panel plafon recessed & bohlam lampu gantung satu sumber —
// sebelumnya literal 0xF0F4FF/0x2E3A52/0xFFF3D6/0x3A3426 diketik ulang di
// room.js (createCeilingFixtures) dan duplikat di ceil_night_swap.test.js.
// Nilai identik kode lama (siklus 169) — tampilan tak berubah.
export const CEIL_PANEL_DAY = 0xF0F4FF;   // panel putih hangat (n=114, bidang unlit terluas)
export const CEIL_PANEL_NIGHT = 0x2E3A52; // biru arsitektural gelap — harmonis WALL_NIGHT #1B2436
export const PEND_BULB_DAY = 0xFFF3D6;    // bohlam hangat
export const PEND_BULB_NIGHT = 0x3A3426;  // amber sangat redup — hue hangat terjaga (R≥G>B), lum ~¼
