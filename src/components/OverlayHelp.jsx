import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useDialogA11y } from '../lib/dialogA11y'
import { IconClose } from './Icons'
import { formatShortcutHelpSummary, KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES } from '../scene/parts/shortcut_spec'

const STEPS = [
  { title: 'Navigasi 3D', text: 'Tarik untuk memutar, scroll / cubit untuk zoom, atau pakai tombol 🔍＋ / 🔍－. Geser slider untuk mengubah waktu.' },
  { title: 'Chat & Konfigurasi Agent', text: 'Klik 💬 Chat AI Team atau klik karakter / nama agent untuk ngobrol dan mengatur model API tiap agent.' },
  { title: 'Aksi Tim', text: 'Tombol ⚡ Aksi Tim: kumpulkan meeting, coffee break, kembali kerja, atau office tour.' },
  { title: 'Task', text: '＋ Task membuat task baru, ⏸ Jeda menghentikan semua task yang berjalan, ▶ Lanjut menjalankan ulang task yang menunggu.' },
  { title: 'Warna Badge', text: 'Warna dada karakter = status task: hijau selesai, kuning berjalan, merah gagal, biru review.' },
  { title: 'Shortcut Keyboard', text: formatShortcutHelpSummary() },
]

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua' },
  ...Object.values(SHORTCUT_CATEGORIES).map(c => ({ id: c.id, label: c.label })),
]

function filterShortcuts(list, query, category) {
  const q = (query || '').trim().toLowerCase()
  return list.filter(s => {
    if (category && category !== 'all' && s.category !== category) return false
    if (!q) return true
    return `${s.key} ${s.label} ${s.desc}`.toLowerCase().includes(q)
  })
}

export default function OverlayHelp({ show, onClose }) {
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const ref = useRef(null)
  const close = () => { setStep(0); setQuery(''); setCategory('all'); onClose() }

  const closeRef = useRef(close)
  useEffect(() => { closeRef.current = close })
  const closeHelp = useCallback(() => closeRef.current(), [])
  useDialogA11y({ open: show, onClose: closeHelp, ref })

  const visibleShortcuts = useMemo(
    () => filterShortcuts(KEYBOARD_SHORTCUTS, query, category),
    [query, category],
  )

  if (!show) return null
  const isEmpty = visibleShortcuts.length === 0
  return (
    <div className="modal-scrim" role="presentation" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="help-t" tabIndex={-1} ref={ref} onClick={e => e.stopPropagation()}>
        <button type="button" className="x" onClick={close} title="Tutup panduan (Esc)" aria-label="Tutup panduan">
          <IconClose size={16} />
          <span className="sr-only">✕</span>
        </button>
        <div aria-live="polite">
          <h3 id="help-t">{STEPS[step].title} <span style={{ opacity: .6, fontSize: 12 }}>({step + 1}/{STEPS.length})</span></h3>
          {STEPS[step].title === 'Shortcut Keyboard' ? (
            <div className="help-shortcut-container" role="region" aria-label="Daftar shortcut keyboard">
              <div className="help-shortcut-tools">
                <input
                  type="search"
                  className="help-shortcut-search"
                  placeholder="Cari tombol atau aksi… (mis. kamera, zoom)"
                  aria-label="Cari shortcut"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <div className="help-shortcut-tabs" role="tablist" aria-label="Kategori shortcut">
                  {CATEGORY_TABS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={category === t.id}
                      className={'help-shortcut-tab' + (category === t.id ? ' active' : '')}
                      onClick={() => setCategory(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="sr-only" role="status">{visibleShortcuts.length} shortcut ditampilkan</p>
              </div>
              {isEmpty ? (
                <p className="help-shortcut-empty">Tidak ada shortcut yang cocok dengan “{query}”.</p>
              ) : (
                <div className="help-shortcut-grid">
                  {visibleShortcuts.map(s => (
                    <div key={s.key} className="help-shortcut-card">
                      <kbd className="help-shortcut-kbd">{s.key}</kbd>
                      <div className="help-shortcut-info">
                        <div className="help-shortcut-label">{s.label}</div>
                        <div className="help-shortcut-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>{STEPS[step].text}</p>
          )}
        </div>
        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Sebelumnya</button>
          {step < STEPS.length - 1
            ? <button type="button" className="btn primary" onClick={() => setStep(s => s + 1)}>Berikutnya →</button>
            : <button type="button" className="btn primary" onClick={close}>Selesai</button>}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}><button type="button" className="btn" style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)' }} onClick={close}>Tutup (Esc)</button></div>
      </div>
    </div>
  )
}
