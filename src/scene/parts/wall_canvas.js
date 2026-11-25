// painter kanvas tekstur dinding (panel + nat + bevel gradien) — murni, ctx di-inject.
// Urutan & parameter perintah gambar identik fungsi tex() inline lama di OfficeScene.
// Warna gradien juga diekspor agar pemanggil cukup memanggil painter tanpa melihat detail.
// Siklus 453: seluruh konstanta warna dinding delegasi ke ui_palette.js (blok WC_*) —
// nilai historis terkunci; tampilan dinding & trim/pilar identik.
import {
  WC_TEX_TOP as WALL_TEX_TOP,
  WC_TEX_BOTTOM as WALL_TEX_BOTTOM,
  WC_UPPER_DAY as WALL_UPPER_DAY,
  WC_WOOD_DAY  as WALL_WOOD_DAY,
  WC_NIGHT_UPPER as NIGHT_UPPER,
  WC_NIGHT_WOOD  as NIGHT_WOOD,
  WC_TRIM_DAY, WC_TRIM_NIGHT,
  WC_PIER_DAY, WC_PIER_NIGHT,
  WC_STOP_0, WC_STOP_22, WC_STOP_34, WC_STOP_72, WC_STOP_86,
  WC_AO_IN, WC_AO_OUT,
} from '../../lib/ui_palette.js';

export { WALL_TEX_TOP, WALL_TEX_BOTTOM, WALL_UPPER_DAY, WALL_WOOD_DAY,
         WC_TRIM_DAY as TRIM_DAY, WC_TRIM_NIGHT as TRIM_NIGHT,
         WC_PIER_DAY as PIER_DAY, WC_PIER_NIGHT as PIER_NIGHT };

export const WALL_NIGHT = { upper: NIGHT_UPPER, wood: NIGHT_WOOD };

export function drawWallTex(ctx, base, line, wpx = 512, hpx = 256, step = 64) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, wpx, hpx);
  ctx.strokeStyle = line;
  ctx.lineWidth = 3;
  for (let i = 0; i <= wpx; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, hpx);
    ctx.stroke();
  }
  // seam panel horizontal — memecah kepolosan bidang vertikal
  ctx.lineWidth = 1.5;
  for (let j = 64; j < hpx; j += 64) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(wpx, j);
    ctx.stroke();
  }
  // pita satin lembut (kesan finishing dinding premium)
  const st = ctx.createLinearGradient(0, 0, wpx, 0);
  st.addColorStop(0, WC_STOP_0); st.addColorStop(0.22, WC_STOP_22);
  st.addColorStop(0.34, WC_STOP_34); st.addColorStop(0.72, WC_STOP_72);
  st.addColorStop(0.86, WC_STOP_86);
  ctx.fillStyle = st; ctx.fillRect(0, 0, wpx, hpx);
  // AO tepi kiri/kanan tile — panel terasa berdimensi
  const aoL = ctx.createLinearGradient(0, 0, 46, 0);
  aoL.addColorStop(0, WC_AO_IN); aoL.addColorStop(1, WC_AO_OUT);
  ctx.fillStyle = aoL; ctx.fillRect(0, 0, 46, hpx);
  const aoR = ctx.createLinearGradient(wpx, 0, wpx - 46, 0);
  aoR.addColorStop(0, WC_AO_IN); aoR.addColorStop(1, WC_AO_OUT);
  ctx.fillStyle = aoR; ctx.fillRect(wpx - 46, 0, 46, hpx);
  const g = ctx.createLinearGradient(0, 0, 0, hpx);
  g.addColorStop(0, WALL_TEX_TOP);
  g.addColorStop(1, WALL_TEX_BOTTOM);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, wpx, hpx);
}
