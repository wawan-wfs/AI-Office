// Siklus 561: badge unread tombol "Log" di dock.
//
// Tombol Log dirender inline di App.jsx (bukan komponen terpisah), sementara
// item log ditulis lewat pushLog → localStorage. Daripada prop drilling state
// baru ke JSX dock, badge ini mendengarkan CustomEvent 'wfs-activity-updated'
// (di-dispatch pushLog setiap status task berubah) + memantau localStorage
// 'wfs_activity' saat mount/siap-siap. Badge hilang setelah dialog log dibuka.
import React, { useState, useEffect } from 'react'
import { loadActivityLog, PREF_ACTIVITY_KEY } from '../lib/storage_prefs.js'

// listener storage hanya fire di tab LAIN — di tab ini kita dengar event
// + flag 'sudah dilihat' (timestamp terakhir dialog dibuka) di localStorage.
const SEEN_KEY = 'wfs_activity_seen'

const markSeen = () => {
  try { localStorage.setItem(SEEN_KEY, String(Date.now())) } catch { /* abaikan */ }
}

export const activityMarkSeen = markSeen

export function useUnreadActivity(open) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const compute = () => {
      try {
        const items = loadActivityLog()
        const seen = Number(localStorage.getItem(SEEN_KEY)) || 0
        // item ber-stempel waktu 'HH.MM' — bandingkan via urutan array dgn
        // seen ts tidak mudah; cukup: ada item & belum dibuka sejak mount → badge.
        setCount(seen === 0 && items.length > 0 ? Math.min(items.length, 9) : 0)
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
