// Siklus 562: badge unread tombol "Log" di dock — per-item seen (paritas TaskBoard).
//
// Tombol Log dirender inline di App.jsx (bukan komponen terpisah), sementara
// item log ditulis lewat pushLog → localStorage. Daripada prop drilling state
// baru ke JSX dock, badge ini mendengarkan CustomEvent 'wfs-activity-updated'
// (di-dispatch pushLog setiap status task berubah) + memantau localStorage
// 'wfs_activity' saat mount/berubah. Badge hilang setelah dialog log dibuka.
//
// Siklus 561 memakai satu timestamp "terakhir dibuka" — cacatnya: setelah
// dialog dibuka SEKALI, markSeen() menulis timestamp dan badge tidak akan
// pernah muncul lagi untuk item baru (seen === 0 tak tercapai kembali).
// Sekarang: set ID item yang pernah dilihat ('wfs_activity_seen' — array,
// cap 200). Item log punya id task unik; pushLog selalu mengirim id, item
// tanpa id dihitung unread agar tidak hilang diam-diam.
import React, { useState, useEffect, useRef } from 'react'
import { loadActivityLog, ACTIVITY_LOG_MAX } from '../lib/storage_prefs.js'

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

export function useUnreadActivity(open) {
  const [count, setCount] = useState(0)
  const openRef = useRef(open)
  openRef.current = open
  useEffect(() => {
    const compute = () => {
      // Siklus 564: dialog Log terbuka → semua item terlihat user; tandai seen
      // & sembunyikan badge (sebelumnya badge tetap muncul utk item yang baru
      // masuk SELAGI dialog terbuka, dan item itu tak pernah di-mark seen).
      if (openRef.current) { markSeen(); setCount(0); return }
      try {
        const seen = new Set(loadSeen())
        const unread = loadActivityLog().filter(x => !x || x.id === undefined || x.id === null || !seen.has(String(x.id)))
        setCount(Math.min(unread.length, 9))
      } catch { setCount(0) }
    }
    compute()
    window.addEventListener('wfs-activity-updated', compute)
    window.addEventListener('storage', compute)
    return () => {
      window.removeEventListener('wfs-activity-updated', compute)
      window.removeEventListener('storage', compute)
    }
  }, [])

  useEffect(() => {
    if (open) { markSeen(); setCount(0) }
  }, [open])

  return count
}

export function ActivityBadge({ count }) {
  if (!count) return null
  return <i className="log-badge" aria-hidden="true">{count}</i>
}
