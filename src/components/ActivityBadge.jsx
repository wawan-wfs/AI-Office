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
import { loadActivityLog } from '../lib/storage_prefs.js'
// Siklus 670: set seen pindah ke lib/activity_seen.js — file komponen kini
// hanya eksport ActivityBadge + useUnreadActivity (react-refresh bersih).
import { activityMarkSeen, activitySeenIds } from '../lib/activity_seen.js'

// eslint-disable-next-line react-refresh/only-export-components -- hook, bukan komponen; dipakai App.jsx (bukan hot-reload kritis)
export function useUnreadActivity(open) {
  const [count, setCount] = useState(0)
  // Siklus 670: ref ditulis di effect (bukan saat render) — react-hooks/refs
  // melarang akses/penulisan ref selama render; perilaku tetap: listener
  // sekali-mount membaca status dialog TERBARU.
  const openRef = useRef(open)
  useEffect(() => { openRef.current = open }, [open])
  useEffect(() => {
    const compute = () => {
      // Siklus 564: dialog Log terbuka → semua item terlihat user; tandai seen
      // & sembunyikan badge (sebelumnya badge tetap muncul utk item yang baru
      // masuk SELAGI dialog terbuka, dan item itu tak pernah di-mark seen).
      if (openRef.current) { activityMarkSeen(); setCount(0); return }
      try {
        const seen = new Set(activitySeenIds())
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset badge saat dialog dibuka; sengaja sinkron
    if (open) { activityMarkSeen(); setCount(0) }
  }, [open])

  return count
}

export function ActivityBadge({ count }) {
  if (!count) return null
  return <i className="log-badge" aria-hidden="true">{count}</i>
}
