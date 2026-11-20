// Siklus 670: set seen log aktivitas satu sumber — dipindah dari
// ActivityBadge.jsx (yang kini hanya eksport komponen + hook, memenuhi
// react-refresh/only-export-components). API & key tidak berubah:
// SEEN_KEY, activityMarkSeen, activitySeenIds, activityClearAll.
import { loadActivityLog } from './storage_prefs.js'

export const SEEN_KEY = 'wfs_activity_seen'
const SEEN_CAP = 200 // >> ACTIVITY_LOG_MAX(50) — ruang geser aman

const loadSeen = () => {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string' || typeof x === 'number') : []
  } catch { return [] }
}

const saveSeen = (ids) => {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-SEEN_CAP))) } catch { /* abaikan */ }
}

const markSeen = () => {
  const seen = new Set(loadSeen())
  loadActivityLog().forEach(x => { if (x && x.id !== undefined && x.id !== null) seen.add(String(x.id)) })
  saveSeen([...seen])
}

export const activityMarkSeen = markSeen
export const activitySeenIds = loadSeen

// Siklus 565: bersihkan log & set seen sekaligus — "Bersihkan" di dialog Log
// sebelumnya hanya menghapus 'wfs_activity', set seen dibiarkan menumpuk
// sampai cap 200 (ID task lama tak pernah terpakai lagi).
export const activityClearAll = () => {
  saveSeen([])
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('wfs_activity')
  } catch { /* abaikan */ }
}
