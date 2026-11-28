// Siklus 577: SATU SUMBER validasi URL eksternal sebelum window.open.
// URL dari API bentuk sah non-string (objek/array) atau skema berbahaya
// ('javascript:', 'data:') tidak boleh dibuka — window.open('javascript:…')
// mengeksekusi skrip di origin, non-string → about:blank kosong aneh.
export const isSafeHttpUrl = (u) => {
  if (typeof u !== 'string') return false;
  const t = u.trim();
  if (!t) return false;
  try {
    const parsed = new URL(t, 'https://placeholder.invalid');
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};
