import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { useDialogA11y } from '../lib/dialogA11y'
import { useModalFlag } from '../lib/modal'
import { IconClose } from './Icons'
// Siklus 521: e.message non-string → crash React child di form task baru.
import { normalizeClipText as normErr } from '../lib/clip.js'

const ROLES = ['backend', 'frontend', 'mobile', 'design', 'devops', 'qa', 'marketing', 'pm']

// Modal buat task nyata (POST /api/tasks). Opsional langsung dijalankan.
export default function TaskModal({ show, onClose, onDone }) {
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('backend')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const first = useRef(null)
  const box = useRef(null)
  const onCloseRef = useRef(onClose)
  // Guard async (siklus 132 — pola rid sama dgn App 126 / TaskBoard 131):
  // submit() menggantung saat gateway lambat, user menutup modal lalu membuka
  // dan mengetik task BARU → respons submit LAMA telat: (1) onDone (flash +
  // refreshStatus di App) basi tetap jalan, (2) setTitle('')/setPrompt('')
  // MENGHAPUS input user, (3) onClose() menutup modal BARU yang sedang diedit,
  // (4) catch basi memunculkan alert di form baru. rid per-modal (hanya satu
  // modal, tak perlu per-surface): hanya submit terbaru yang boleh menulis
  // state; membuka modal menaikkan rid → semua respons milik submit lama basi.
  // Tanpa AbortController sengaja: satu titik kebenaran (rid), pola siklus 126.
  // Ref didefinisikan di ATAS early-return `if (!show)` — jumlah hook wajib
  // konsisten antar render (modal tutup vs buka), rules of hooks.
  const rid = useRef(0)
  // Lock reentrancy submit (siklus 493, pola 490/491/492): tombol Simpan /
  // Simpan & Jalankan hanya di-disabled via state `busy` — dua klik cepat
  // sebelum re-render menjalankan submit() dua kali → POST /tasks dobel
  // (task duplikat) atau POST /tasks/{id}/run dobel (BERBAYAR, task dikirim
  // ke agent dua kali). Lock ref langsung di awal submit(), sebelum await.
  const submitInFlight = useRef(false)
  useModalFlag(show)
  useEffect(() => { onCloseRef.current = onClose })
  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state generasi lama saat modal dibuka (pola lama, disengaja)
      setErr('')
      // (rid.current++ tanpa disable: bump ref, bukan setState — tak memicu render)
      setBusy(false) // form generasi baru langsung siap, tak menunggu submit lama selesai
      rid.current++ // modal dibuka ulang → semua submit in-flight lama jadi basi
    }
  }, [show])

  const closeViaA11y = useCallback(() => onCloseRef.current(), [])
  useDialogA11y({ open: show, onClose: closeViaA11y, ref: box, initialFocus: first })

  if (!show) return null
  const submit = async (run) => {
    const my = rid.current // rid HANYA naik saat modal dibuka (effect) — dobel klik = generasi sama
    if (submitInFlight.current === my) return // dobel klik cepat pada submit SAMA: POST dobel dicegah
    submitInFlight.current = my
    try {
      if (!title.trim()) return setErr('Judul task wajib diisi')
      setBusy(true); setErr('')
      const d = await api('tasks', { method: 'POST', body: { title: title.trim(), role, prompt: prompt.trim() } })
      if (my !== rid.current) return // basi: task lama TIDAK dijalankan (run berbayar — jangan auto-run task yang sudah di-abandon user)
      if (run) await api(`tasks/${d.task_id}/run`, { method: 'POST' })
      if (my !== rid.current) return // submit lebih baru / modal dibuka ulang — respons basi
      onDone(run ? `Task #${normErr(d.task_id)} dibuat & dijalankan` : `Task #${normErr(d.task_id)} dibuat (pending)`)
      setTitle(''); setPrompt(''); onClose()
      setBusy(false)
    } catch (e) {
      if (my !== rid.current) return // kegagalan basi — jangan munculkan alert di form baru
      setErr(normErr(e.message))
      setBusy(false)
    } finally {
      if (submitInFlight.current === my) submitInFlight.current = false
    }
  }
  return (
    <div className="modal-scrim" role="presentation" onClick={onClose}>
      <form ref={box} className="modal" role="dialog" aria-modal="true" aria-labelledby="tm-t" aria-describedby={err ? 'tm-err' : undefined} onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); submit(false) }}>
        <button type="button" className="x" onClick={onClose} title="Tutup form task (Esc)" aria-label="Tutup form task">
          <IconClose size={16} />
          <span className="sr-only">✕</span>
        </button>
        <h3 id="tm-t">＋ Task Baru</h3>
        <label htmlFor="tm-title">Judul</label>
        <input id="tm-title" ref={first} value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="mis. Buat endpoint /api/invoice" aria-required="true" aria-invalid={!!err && !title.trim()} aria-describedby={err ? 'tm-err' : undefined} />
        <label htmlFor="tm-role">Role / agent</label>
        <select id="tm-role" value={role} onChange={e => setRole(e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
        <label htmlFor="tm-prompt">Brief (opsional)</label>
        <textarea id="tm-prompt" rows={4} maxLength={4000} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Detail yang harus dikerjakan agent" />
        {err && <div id="tm-err" role="alert" className="msg err" style={{ maxWidth: '100%', marginTop: 10 }}>{err}</div>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Batal</button>
          <button type="submit" className="btn" disabled={busy}>Simpan</button>
          <button type="button" className="btn primary" disabled={busy} onClick={() => submit(true)}>Simpan & Jalankan</button>
        </div>
      </form>
    </div>
  )
}
