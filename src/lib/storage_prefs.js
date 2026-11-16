// Siklus 346: preferensi scene satu sumber — lib/storage_prefs.js
import { fmtStampId } from './format_time.js'

// Keys: wfs_names (default true), wfs_autorot (default false).
// Sebelumnya 4 salinan try/catch localStorage.getItem tersebar di ActionMenu,
// SettingsModal, OfficeScene (+2 salinan set di OfficeScene) — rawan drift
// nilai default/parsing antar komponen (pelajaran 333).

export const PREF_NAMES_KEY = 'wfs_names'
export const PREF_AUTOROT_KEY = 'wfs_autorot'

const safeGet = (key) => {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  } catch { return null }
}

const safeSet = (key, value) => {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
  } catch { /* private storage / abaikan */ }
}

// Label nama agent & zona: default ON kecuali tersimpan eksplisit '0'.
export const namesPrefOn = () => safeGet(PREF_NAMES_KEY) !== '0'

export const setNamesPref = (on) => safeSet(PREF_NAMES_KEY, on ? '1' : '0')

// Auto-rotate kamera: default OFF kecuali tersimpan eksplisit '1'.
// (Catatan: keputusan prefers-reduced-motion tetap di pemanggil scene.)
export const autoRotatePrefOn = () => safeGet(PREF_AUTOROT_KEY) === '1'

export const setAutoRotatePref = (on) => safeSet(PREF_AUTOROT_KEY, on ? '1' : '0')

// Preferensi tersimpan eksplisit oleh user? (null = belum pernah set)
export const hasStoredPref = (key) => {
  const v = safeGet(key)
  return v === '0' || v === '1'
}

// ── Siklus 347: view mode / neon / audio mute satu sumber ──
// Sebelumnya: 2 salinan try/catch wfs_view_mode di App.jsx, 2 salinan
// wfs_neon di App.jsx & OfficeScene.js, 2 salinan wfs_audio_muted di
// App.jsx & OfficeScene.js — default & parsing rawan drift (pelajaran 333).

export const PREF_VIEW_MODE_KEY = 'wfs_view_mode'
// Landing links override; nilai tak dikenal → default '2d'.
export const viewModePref = () => (safeGet(PREF_VIEW_MODE_KEY) === '3d' ? '3d' : '2d')
export const setViewModePref = (mode) => safeSet(PREF_VIEW_MODE_KEY, mode)

export const PREF_NEON_KEY = 'wfs_neon'
export const neonPrefOn = () => safeGet(PREF_NEON_KEY) === '1'
export const setNeonPref = (on) => safeSet(PREF_NEON_KEY, on ? '1' : '0')
export const clearNeonPref = () => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PREF_NEON_KEY)
  } catch { /* abaikan */ }
}

export const PREF_MUTED_KEY = 'wfs_audio_muted'
export const audioMutedPref = () => safeGet(PREF_MUTED_KEY) === '1'
export const setAudioMutedPref = (on) => safeSet(PREF_MUTED_KEY, on ? '1' : '0')

// Siklus 348: log aktivitas satu sumber — wfs_activity (JSON array, max 50).
// Sebelumnya 3 salinan try/catch inline di App.jsx (read/write/clear) — rawan
// drift: JSON rusak → semua pemanggil harus ingat fallback [] sendiri.
export const PREF_ACTIVITY_KEY = 'wfs_activity'
export const ACTIVITY_LOG_MAX = 50

export const loadActivityLog = () => {
  try {
    const raw = safeGet(PREF_ACTIVITY_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export const saveActivityLog = (items) => {
  const n = Array.isArray(items) ? items.slice(0, ACTIVITY_LOG_MAX) : []
  safeSet(PREF_ACTIVITY_KEY, JSON.stringify(n))
  return n
}

export const clearActivityLog = () => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PREF_ACTIVITY_KEY)
  } catch { /* abaikan */ }
}

// Siklus 566: dedup baris kembar berurutan — pushLog bisa dipanggil dua kali
// dgn transisi yang sama (race antar poll rid) → log berisi baris kembar & 
// badge unread menghitung ganda. Aturan: entri baru dibandingkan dgn HEAD LOG
// LAMA (items[1], karena items[0] = entri baru itu sendiri); bila identik,
// salinan lama dibuang, entri baru tetap. Transisi berbeda tak tersentuh.
export const dedupeLogHead = (items, e) => {
  if (!Array.isArray(items) || !e || items.length < 2) return items
  const prev = items[1]
  if (prev && prev.id === e.id && prev.status === e.status && prev.label === e.label) {
    return [items[0], ...items.slice(2)]
  }
  return items
}

// Siklus 568: builder teks log untuk tombol "Salin" — murni & diuji terpisah,
// tanpa clipboard/petunjuk UI. Baris: 'HH.MM.SS | label | #id title';
// stempel rusak/lama → fallback apa adanya; item tanpa id → '[?]' dihapus
// duplikasi antar baris agar tak dobel di teks.
export const formatLogText = (items) => {
  if (!Array.isArray(items) || items.length === 0) return ''
  const seen = new Set()
  const lines = []
  for (const x of items) {
    const id = x && x.id !== undefined && x.id !== null ? `#${x.id}` : '[?]'
    const stamp = (x && fmtStampId(x.t)) || (x && x.t) || ''
    const label = (x && x.label) || ''
    const title = (x && x.title) || ''
    const line = `${stamp} | ${label} | ${id} ${title}`.replace(/\s+$/, '')
    if (seen.has(line)) continue
    seen.add(line)
    lines.push(line)
  }
  return lines.join('\n')
}

// Siklus 569: ekspor log ke FILE (.txt) — pelengkap Salin (clipboard sering
// ditolak di browser mobile). Murni & diuji terpisah; unduhan via
// downloadExportFile (satu sumber kanban_export) di ActivityLog.
const pad2 = (n) => String(n).padStart(2, '0')

export const formatLogFilename = (now) => {
  const d = now instanceof Date ? now : new Date(now)
  if (!d || Number.isNaN(d.getTime())) return null
  const Y = d.getFullYear(), M = pad2(d.getMonth() + 1), D = pad2(d.getDate())
  const h = pad2(d.getHours()), m = pad2(d.getMinutes()), s = pad2(d.getSeconds())
  return `log-aktivitas-${Y}${M}${D}-${h}${m}${s}.txt`
}

export const formatLogFileText = (items, now) => {
  const fname = formatLogFilename(now)
  const stamp = fname ? fname.replace(/^log-aktivitas-/, '').replace(/\.txt$/, '') : ''
  const head = `Log Aktivitas WFS${stamp ? ` — diekspor ${stamp}` : ''}`
  const body = formatLogText(items)
  return body ? `${head}\n${'-'.repeat(24)}\n${body}\n` : `${head}\n`
}

// Siklus 349: flag handshake landing→app satu sumber.
// Landing (public/landing.html) menulis 'wfs_open_dashboard'=1 sebelum redirect;
// App.jsx membaca+hapus sekali lalu dispatch event dashboard. Dipindah ke sini
// agar fallback anti-storage-rusak tidak tersebar di pemanggil.
export const PREF_OPEN_DASHBOARD_KEY = 'wfs_open_dashboard'

export const takeOpenDashboardFlag = () => {
  try {
    if (typeof localStorage === 'undefined') return false
    if (localStorage.getItem(PREF_OPEN_DASHBOARD_KEY) !== '1') return false
    localStorage.removeItem(PREF_OPEN_DASHBOARD_KEY)
    return true
  } catch { return false }
}
