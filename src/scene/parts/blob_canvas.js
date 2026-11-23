// painter kanvas bayangan kontak (blob shadow) — murni, ctx di-inject
// Urutan & parameter perintah gambar identik kode inline lama di OfficeScene.
export const BLOB_SIZE = 128;
export const BLOB_CENTER = 64;

export const BLOB_GLOW_0 = 'rgba(10,14,18,0.55)';
export const BLOB_GLOW_MID = 'rgba(10,14,18,0.30)';
export const BLOB_GLOW_END = 'rgba(10,14,18,0)';

export function drawBlobShadow(ctx) {
  const g = ctx.createRadialGradient(BLOB_CENTER, BLOB_CENTER, 4, BLOB_CENTER, BLOB_CENTER, 62);
  g.addColorStop(0, BLOB_GLOW_0);
  g.addColorStop(0.55, BLOB_GLOW_MID);
  g.addColorStop(1, BLOB_GLOW_END);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, BLOB_SIZE, BLOB_SIZE);
}
