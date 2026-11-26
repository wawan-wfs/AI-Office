// Pemangkas teks di batas KATA terakhir + '…' (dipakai lintas UI, bukan hanya scene)
// Siklus 508 — ANTI-POISONING: field non-string (bentuk sah API: title numerik,
// desc/objek, array) dulu membuat `s.length` undefined → `s.slice` melempar
// TypeError → kartu task/flash log crash. Kini dinormalisasi aman:
// null/undefined/'' → '', objek/array → JSON, angka finite/boolean → String,
// NaN/±Infinity → ''. `n` tak valid (NaN/≤0/bukan angka) → teks utuh tanpa
// pemangkasan (dulu menghasilkan '…' telanjang).
export function normalizeClipText(s) {
  if (s == null || s === '') return '';
  if (typeof s === 'string') return s;
  if (typeof s === 'number') return Number.isFinite(s) ? String(s) : '';
  if (typeof s === 'boolean') return String(s);
  try { return JSON.stringify(s) ?? ''; } catch { return ''; }
}

export function clip(s, n) {
  const text = normalizeClipText(s);
  const lim = Number(n);
  if (!Number.isFinite(lim) || lim <= 0) return text;
  if (text.length <= lim) return text;
  const cut = text.slice(0, lim);
  const sp = cut.lastIndexOf(' ');
  return (sp > lim * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…';
}
