// painter kanvas bayangan platform (pedestal) — murni, ctx di-inject (pola blob_canvas.js)
// Gradient radial lembut: pekat di tengah, transparan di tepi → bayangan kontak
// yang menjalar dari dasar pedestal ke void, membumikan dek kampus.
export const SHADOW_SIZE = 128;
export const SHADOW_CENTER = 64;

export const SHADOW_GLOW_0 = 'rgba(2,6,14,0.85)';
export const SHADOW_GLOW_MID = 'rgba(2,6,14,0.5)';
export const SHADOW_GLOW_END = 'rgba(2,6,14,0)';

export function drawPlatformShadow(ctx) {
  const g = ctx.createRadialGradient(SHADOW_CENTER, SHADOW_CENTER, 8, SHADOW_CENTER, SHADOW_CENTER, 62);
  g.addColorStop(0, SHADOW_GLOW_0);
  g.addColorStop(0.55, SHADOW_GLOW_MID);
  g.addColorStop(1, SHADOW_GLOW_END);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SHADOW_SIZE, SHADOW_SIZE);
}
