import React, { useEffect, useState, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { fmtUptime } from '../lib/uptime'
import { useVisibilityPoll } from '../lib/dialogA11y'
import { clockNowId } from '../lib/format_time'
import { normalizeClipText as norm } from '../lib/clip.js'

// Siklus 524: field API (agents/load/ram/disk) bentuk sah non-string/objek
// → "Objects are not valid as a React child" atau "[object Object]" di chip
// & aria-label. Semua render dinormalisasi satu sumber (clip.js), pola seri
// 512-523. fmtUptime sudah tahan non-angka (lib/uptime.js).

// Meter status host — data NYATA dari gateway (status + resources), polled tiap 12 dtk.
// Widget kecil kanan-atas supaya "data yang ada" selalu terlihat tanpa buka panel.

export default function SysMeter() {
  const [d, setD] = useState(null)
  const [sceneAgents, setSceneAgents] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [err, setErr] = useState(false)
  const stateRef = useRef({ stop: false, rid: 0 })

  // guard out-of-order (pola TaskBoard siklus 131): poll #2 menyusul saat #1
  // menggantung (tak di-abort) → respons LAMA tak menimpa data BARU,
  // kegagalan poll basi tak menampilkan "Gateway offline" palsu.
  const load = useCallback(async () => {
    const s = stateRef.current
    const my = ++s.rid
    try {
      const [st, res] = await Promise.all([api('status'), api('system/resources')])
      if (s.stop || my !== s.rid) return
      setD({ ...st, load: res?.load ?? '—', ram: res?.ram_mb ?? '—' })
      setErr(false)
      setUpdatedAt(clockNowId(true))
    } catch {
      if (!s.stop && my === s.rid) setErr(true)
    }
  }, [])
  // Siklus 339: poll API status satu sumber via useVisibilityPoll — interval
  // 12 dtk ter-gerbang visibilityState + refresh SEGERA saat tab kembali
  // visible (siklus 321), cleanup berpasangan. Keduanya kini bagian dari hook.
  useVisibilityPoll(load, 12000)
  // hitungan agen dari scene 3D (window.__agentData diisi OfficeScene) — sumber kebenaran visual
  // Siklus 319→339: gerbang visibilityState + baca ulang segera saat visible
  // kini satu sumber via useVisibilityPoll.
  useVisibilityPoll(() => setSceneAgents((window.__agentData || []).length || null), 4000)

  useEffect(() => () => { stateRef.current.stop = true }, [])

  if (!d) {
    return (
      <div className="sysmeter" role="status" aria-label="Status host">
        <span className="sm-item">{err ? 'Gateway offline' : 'Memuat host…'}</span>
      </div>
    )
  }
  return (
    <div className="sysmeter" role="status" aria-label="Status host">
      {err && <span className="sm-item" role="alert" title="Poll terakhir gagal; data mungkin usang">⚠ data usang · {updatedAt}</span>}
      {!err && (
        <span className="sm-item sm-hl" title="Gateway terhubung, data live" aria-label="Gateway terhubung, data live"><i aria-hidden="true" /> host live</span>
      )}
      <span className="sm-item" title="Agen dari status backend" aria-label={`Agen task engine: ${norm(d.agents) ?? 'tidak tersedia'}`}>{norm(d.agents) || '—'} agen task engine</span>
      {sceneAgents && <span className="sm-item" title="Avatar ambient, bukan status pekerjaan" aria-label={`${sceneAgents} avatar simulasi di scene (bukan status pekerjaan)`}>{sceneAgents} avatar simulasi</span>}
      <span className="sm-item" title="Load average host" aria-label={`Load average host: ${norm(d.load)}`}>⚡ {norm(d.load) || '—'}</span>
      <span className="sm-item" title="RAM terpakai / total" aria-label={`RAM terpakai per total: ${norm(d.ram)} MB`}>🧠 {norm(d.ram) || '—'}</span>
      <span className="sm-item" title="Disk terpakai / total" aria-label={`Disk terpakai per total: ${norm(d.disk_used_gb)} dari ${norm(d.disk_total_gb)} GB`}>💾 {norm(d.disk_used_gb) || '—'}/{norm(d.disk_total_gb) || '—'} GB</span>
      <span className="sm-item" title="Uptime host" aria-label={`Uptime host: ${fmtUptime(d.uptime_s)}`}>⏱ {fmtUptime(d.uptime_s)}</span>
    </div>
  )
}
