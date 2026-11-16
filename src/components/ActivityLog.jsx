import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useDialogA11y } from '../lib/dialogA11y'
import { IconClose } from './Icons'
import { taskStatusColor, TASK_STATUS_COLORS } from '../lib/task_status_colors.js'
import { fmtStampId } from '../lib/format_time.js'
import { formatLogText } from '../lib/storage_prefs.js'
import { PURE_TEXT } from '../lib/ui_palette.js';

// Warna status delegasi ke satu sumber (siklus 373) — dulu failed/pending drift.
const COL = {
  done: taskStatusColor('done'),
  running: taskStatusColor('running'),
  failed: taskStatusColor('failed'),
  review: taskStatusColor('review'),
  pending: taskStatusColor('pending'),
}

// Log aktivitas: perubahan status task yang terdeteksi UI (disimpan di localStorage).
export default function ActivityLog({ show, items, onClose, onClear }) {
  const box = useRef(null)
  const onCloseRef = useRef(onClose)
  const [copied, setCopied] = useState(false)
  useEffect(() => { onCloseRef.current = onClose })
  useEffect(() => { if (show) setCopied(false) }, [show])
  const closeLog = useCallback(() => onCloseRef.current(), [])
  useDialogA11y({ open: show, onClose: closeLog, ref: box })
  if (!show) return null
  return (
    <div className="modal-scrim" role="presentation" onClick={onClose}>
      <div ref={box} className="modal" role="dialog" aria-label="Log aktivitas" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button className="x" onClick={onClose} title="Tutup log aktivitas (Esc)" aria-label="Tutup log aktivitas">
          <IconClose size={16} />
          <span className="sr-only">✕</span>
        </button>
        <h3>Log Aktivitas</h3>
        {items.length === 0
          ? <p>Belum ada perubahan status task sejak log dipantau.</p>
          : <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '55dvh', overflowY: 'auto' }}>
              {/* Siklus 566: key stabil per-item — key={i} indeks menggeser semua
                  <li> saat item terlama terpotong CAP 50. id task unik; fallback
                  index hanya utk item tanpa id. */}
              {items.map((x, i) => (
                <li key={x?.id !== undefined && x?.id !== null ? `t-${x.id}` : `i-${i}`} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: 13 }}>
                  {/* Siklus 567: stempel epoch ms (App pushLog) → 'HH.MM.SS' id-ID
                      satu sumber fmtStampId; item lama 'HH.MM' string atau 0
                      (stempel gagal) tetap tampil apa adanya. */}
                  <span style={{ color: TASK_STATUS_COLORS.pending, marginRight: 8 }}>{fmtStampId(x.t) || x.t || ''}</span>
                  <span style={{ color: COL[x.status] || PURE_TEXT, fontWeight: 600 }}>{x.label}</span>
                  {' '}#{x.id} {x.title}
                </li>
              ))}
            </ul>}
        <div className="modal-actions">
          {items.length > 0 && (
            <button
              className="btn"
              onClick={() => {
                // Siklus 568: salin isi log sebagai teks; clipboard bisa
                // gagal (izin/permission) → fallback title, tanpa crash.
                const text = formatLogText(items)
                try {
                  // Promise bisa reject (izin ditolak) → catch agar tak
                  // jadi unhandled rejection; tombol tetap responsif.
                  const p = navigator.clipboard?.writeText(text)
                  if (p && typeof p.then === 'function') p.then(() => setCopied(true)).catch(() => {})
                  else setCopied(true)
                } catch { /* clipboard tak tersedia — abaikan */ }
              }}
              title="Salin log aktivitas ke clipboard"
              aria-label="Salin log aktivitas ke clipboard"
            >{copied ? 'Tersalin ✓' : 'Salin'}</button>
          )}
          {items.length > 0 && <button className="btn" onClick={onClear}>Bersihkan</button>}
          <button className="btn" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}
