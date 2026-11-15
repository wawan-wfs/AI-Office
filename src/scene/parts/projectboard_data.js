// Logika data→teks papan proyek (murni, tanpa canvas/THREE) — diekstrak dari
// projectboard.js agar bisa di-unit-test: persen progres, banner review/gagal,
// item per kolom kanban, dan segmen strip status bawah.

// tata letak kartu kolom: y kartu ke-i (0..5) + tinggi, dijamin tidak menabrak strip bawah (y=794)
const CARD_TOP = 248, CARD_STEP = 88
export const CARD_H = 78, COLUMN_BOTTOM = 788
export function cardY(i) { return CARD_TOP + i * CARD_STEP }

// judul dipotong di batas kata, diberi '…' bila terpotong (jangan memotong di tengah kata)
import { clip } from '../../lib/clip.js'
import { pctDone } from '../../lib/math_util.js'
import { taskStatusColor, TASK_STATUS_COLORS } from '../../lib/task_status_colors.js'
export { clip }

/**
 * Normalisasi status task dari berbagai format (task engine, server WFS, kanban).
 * Memetakan:
 * - 'done', 'completed', 'finished', 'resolved', 'success' -> 'done'
 * - 'running', 'in_progress', 'active', 'working' -> 'running'
 * - 'failed', 'error' -> 'failed'
 * - 'review', 'qa' -> 'review'
 * - 'pending', 'ready', 'queued', 'waiting', 'todo', 'backlog' -> 'pending'
 */
export function normalizeTaskStatus(status) {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'done' || s === 'completed' || s === 'finished' || s === 'resolved' || s === 'success') return 'done'
  if (s === 'running' || s === 'in_progress' || s === 'active' || s === 'working') return 'running'
  if (s === 'failed' || s === 'error') return 'failed'
  if (s === 'review' || s === 'qa') return 'review'
  return 'pending'
}

/**
 * Format ID task secara rapi (misal 'task-9da32873' -> '#9da32873', 21 -> '#21').
 */
export function formatTaskId(id) {
  if (id == null) return ''
  const str = String(id).trim()
  if (!str) return ''
  if (str.startsWith('task-')) {
    return '#' + str.slice(5)
  }
  return str.startsWith('#') ? str : '#' + str
}

/**
 * Label teks status kartu kanban 3D.
 */
export function formatCardStatus(status) {
  const st = normalizeTaskStatus(status)
  if (st === 'done') return '✓ selesai'
  if (st === 'running') return '⚡ berjalan'
  if (st === 'failed') return '✕ gagal'
  if (st === 'review') return '🔍 review'
  return '⏳ antri'
}

/**
 * Format judul kartu kanban 3D dengan ID dan pemotongan rapi.
 */
export function formatCardTitle(task, maxLen = 30) {
  if (!task) return ''
  const idStr = formatTaskId(task.id)
  const title = clip(task.title || '', maxLen)
  return idStr ? `${idStr} ${title}` : title
}

/**
 * Metadata lengkap kartu kanban 3D (murni untuk canvas & rendering).
 */
export function cardMeta(task) {
  if (!task) return null
  const statusKey = normalizeTaskStatus(task.status)
  const colors = TASK_STATUS_COLORS
  return {
    id: task.id,
    formattedId: formatTaskId(task.id),
    title: task.title || '',
    formattedTitle: formatCardTitle(task, 30),
    statusKey,
    statusText: formatCardStatus(task.status),
    statusColor: taskStatusColor(statusKey) || colors.pending,
  }
}

// persen selesai via pctDone satu sumber (math_util): 0 bila tak ada task
// total, dijepit 0–100 dan aman terhadap nilai non-finite (data glitch:
// done>total atau NaN) agar progress bar di papan tak pernah menggambar
// lebar/angka yang mustahil.
export function computePct(T) {
  return pctDone(T?.done, T?.total)
}

// subjudul di bawah judul papan
export function subtitle(T, timeStr) {
  // Siklus 270 — timeStr kosong/tidak diberikan tidak boleh meninggalkan
  // trailing separator "· " gantung di papan 3D (dulu: 'Data live · task engine
  // + SaaS · ' lalu '· review 2' menambah separator ganda).
  const head = 'Data live · task engine + SaaS'
  const parts = []
  if (timeStr) parts.push(timeStr)
  if (T && T.review) parts.push('review ' + T.review)
  if (T && T.failed) parts.push('gagal ' + T.failed)
  return parts.length ? head + ' · ' + parts.join(' · ') : head
}

// chip banner [teks, warna]; kosong bila tidak ada task bermasalah
export function bannerParts(T) {
  const parts = []
  if (!T) return parts
  if (T.failed) parts.push(['GAGAL ' + T.failed, taskStatusColor('failed')])
  if (T.review) parts.push(['REVIEW ' + T.review, taskStatusColor('review')])
  return parts
}

// baris banner (nama task failed/review terbaru) — null bila tak relevan
export function bannerNames(T) {
  if (!T) return null
  const parts = bannerParts(T)
  const has = (st) => (T.recent || []).some(r => normalizeTaskStatus(r.status) === st)
  if (!parts.length || !(has('failed') || has('review'))) return null
  const items = (T.recent || []).filter(r => {
    const s = normalizeTaskStatus(r.status)
    return s === 'failed' || s === 'review'
  }).slice(0, 3)
  return parts.map(p => p[0]).join(' · ') + ' — ' + items.map(r => formatTaskId(r.id) + ' ' + (r.title || '')).join('  ·  ')
}

// layout banner sadar-lebar: ukur lebar dengan font sungguhan; bila melebihi budget,
// buang item terlama (dari belakang) berurutan lalu pangkas item terakhir di batas kata.
// Kembalikan { names: [teks per item], truncated: bool } — null bila tak relevan.
export function bannerLayout(T, measure) {
  const full = bannerNames(T)
  if (!full) return null
  const prefix = parts => parts.map(p => p[0]).join(' · ')
  const parts = bannerParts(T)
  const items = (T.recent || []).filter(r => {
    const s = normalizeTaskStatus(r.status)
    return s === 'failed' || s === 'review'
  }).slice(0, 3)
  const itemText = r => formatTaskId(r.id) + ' ' + (r.title || '')
  const budget = measure.budget
  const sepW = measure.text('—  ·  ')
  const fits = (n) => measure.text(prefix(parts) + ' — ') + sepW + n.reduce((a, t) => a + measure.text(t) + sepW, 0) <= budget
  let names = items.map(itemText)
  let truncated = false
  while (names.length > 1 && !fits(names)) { names.pop(); truncated = true }
  if (!fits(names)) {
    // buang nama task terakhir juga, lalu pangkas di batas kata
    truncated = true
    const head = prefix(parts) + ' — '
    const avail = Math.max(0, budget - measure.text(head) - sepW)
    names = [clip(names[0], Math.max(8, Math.round(avail / (measure.text('n') || 1))))]
  }
  return { head: prefix(parts) + ' — ', names, truncated }
}

// item kartu per kolom kanban (0 antri, 1 jalan, 2 selesai) — maks 6
export function columnItems(T, i) {
  const want = i === 0 ? 'pending' : i === 1 ? 'running' : 'done'
  return ((T && T.recent) || []).filter(r => normalizeTaskStatus(r.status) === want).slice(0, 6)
}

// segmen strip bawah [{txt, col}] dari snapshot penuh (saas + agents + omniroute)
export function stripSegments(snap, hostRes = null) {
  // Siklus 381 — warna delegasi palet kanonik (dulu literal drift):
  //   aksen label  = review  (biru), ok = done, error = failed,
  //   teks sekunder = muted, divider = pending gelap kustom.
  const accent = TASK_STATUS_COLORS.review
  const ok = TASK_STATUS_COLORS.done
  const err = TASK_STATUS_COLORS.failed
  const dim = '#8fa3bd'
  const div = '#44506a'
  const segs = []
  const s = (snap && snap.saas) || {}
  segs.push({ txt: 'SaaS', col: accent })
  if (s.online) {
    const st = s.stats || {}
    segs.push({ txt: (st.tenants || (s.tenants || []).length) + ' tenant', col: ok })
    segs.push({ txt: (st.conversations || 0) + ' chat', col: dim })
    segs.push({ txt: (st.messages || 0) + ' pesan', col: dim })
    segs.push({ txt: 'online', col: ok })
    const act = (s.tenants || []).slice(-1)[0]
    if (act && act.name) segs.push({ txt: 'terbaru: ' + clampStripTenant(act.name), col: TASK_STATUS_COLORS.running })
  } else {
    segs.push({ txt: 'offline', col: err })
  }
  const ags = (snap && snap.agents) || []
  if (ags.length) {
    segs.push({ txt: '·', col: div })
    segs.push({ txt: 'AGENT', col: accent })
    // Siklus 535: nama agen dipangkas di batas kata (pola clampStripTenant) dan
    // jumlah agen dibatasi 4 + "+N" — 9 agen sandbox × nama panjang makan seluruh
    // budget strip dan mendorong segmen lain (termasuk HOST) keluar layar.
    const MAX_AG = 3
    ags.slice(0, MAX_AG).forEach(a => {
      const nm = clip(a.name, 12)
      segs.push({ txt: nm + ' ' + (a.status === 'Up' ? '●' : '○'), col: a.status === 'Up' ? ok : err })
    })
    if (ags.length > MAX_AG) segs.push({ txt: '+' + (ags.length - MAX_AG) + ' lagi', col: dim })
  }
  const omni = (snap && snap.omniroute) || null
  if (omni) {
    segs.push({ txt: '·', col: div })
    segs.push({ txt: 'OMNI', col: accent })
    segs.push({
      txt: omni.online ? (omni.port ? `:${omni.port} ●` : 'online') : 'offline',
      col: omni.online ? ok : err,
      __isOmni: true,
    })
  }
  // Siklus 535 — metrik host NYATA (window.__hostRes dari /wfs-api/status,
  // paritas monitor sysdash 532/533): CPU/MEM/DISK di ujung strip. Host
  // invalid/korup → tidak ada segmen (strip lama tak berubah). Semua segmen
  // host ditandai __drop:'host' — prioritas buang paling rendah (setelah online).
  const host = hostSegments(hostRes)
  if (host.length) {
    segs.push({ txt: '·', col: div, __drop: 'host' })
    host.forEach(sg => segs.push(sg))
  }
  return segs
}

// Segmen strip HOST dari snapshot /wfs-api/status (murni, diuji unit).
// Format teks 'CPU 23%' — nilai di-clamp 1..99, non-finite → segmen dilewati
// (tanpa 'CPU NaN%'); hostRes null/bukan objek → [] (fallback strip lama).
export function hostSegments(hostRes) {
  if (!hostRes || typeof hostRes !== 'object') return []
  const accent = TASK_STATUS_COLORS.review
  const ok = TASK_STATUS_COLORS.done
  const warn = TASK_STATUS_COLORS.running
  const err = TASK_STATUS_COLORS.failed
  const num = (v) => (Number.isFinite(+v) ? +v : null)
  const clamp = (v) => Math.min(99, Math.max(1, Math.round(v)))
  const col = (pct) => (pct < 75 ? ok : pct < 90 ? warn : err)
  const segs = [{ txt: 'HOST', col: accent }]
  const load = num(hostRes.load)
  if (load != null) {
    const pct = clamp(load * 10)
    segs.push({ txt: 'CPU ' + pct + '%', col: col(pct) })
  }
  const tot = num(hostRes.mem_total_mb), av = num(hostRes.mem_available_mb)
  if (tot != null && tot > 0 && av != null) {
    const pct = clamp(100 * (tot - av) / tot)
    segs.push({ txt: 'MEM ' + pct + '%', col: col(pct) })
  }
  const dTot = num(hostRes.disk_total_gb), dUsed = num(hostRes.disk_used_gb)
  if (dTot != null && dTot > 0 && dUsed != null) {
    const pct = clamp(100 * dUsed / dTot)
    segs.push({ txt: 'DISK ' + pct + '%', col: col(pct) })
  }
  // Siklus 537 — UPTIME (uptime_s, detik; paritas sysdash 'Nn'):
  // ≥60 mnt → 'Nj', <60 mnt → 'Nm'; non-finite/≤0 → segmen dilewati.
  const up = num(hostRes.uptime_s)
  if (up != null && up > 0) {
    const mins = Math.floor(up / 60)
    const txt = mins >= 60
      ? Math.floor(mins / 60) + 'j'
      : mins + 'm'
    segs.push({ txt: 'UP ' + txt, col: accent })
  }
  // Siklus 544 — NET throughput nyata (net_rx_mb_s/net_tx_mb_s, paritas bar
  // sysdash 543): rx+tx ≥1 MB/s → 'NET 1.2M', <1 → KB bulat 'NET 31K'; rx/tx
  // negatif di-clamp 0, rx/tx tak valid → segmen dilewati (tanpa 'NET NaN').
  // Sengaja TIDAK masuk hostKey papan (projectboard.js): throughput berubah
  // tiap detik — memasukkannya memicu repaint penuh tiap 20 dtk.
  const rx = num(hostRes.net_rx_mb_s), tx = num(hostRes.net_tx_mb_s)
  if (rx != null && tx != null) {
    const mb = Math.max(0, rx) + Math.max(0, tx)
    const txt = mb >= 1 ? mb.toFixed(1) + 'M' : Math.max(0, Math.round(mb * 1024)) + 'K'
    segs.push({ txt: 'NET ' + txt, col: accent })
  }
  return segs.length > 1 ? segs : []
}

// Segmen FPS papan proyek (siklus 540) — sumber window.__fps (EMA animate,
// paritas sysdash 539). Fungsi terpisah agar hostSegments tetap murni-data:
// hostRes = data gateway, fps = pengukuran renderer. Non-finite → null
// (papan melukis tanpa segmen FPS; tanpa 'FPS NaN').
export function fpsSegment(fps) {
  const f = Number.isFinite(+fps) ? +fps : null
  if (f == null) return null
  const r = Math.max(0, Math.round(f))
  const col = r >= 30 ? TASK_STATUS_COLORS.done : r >= 15 ? TASK_STATUS_COLORS.running : TASK_STATUS_COLORS.failed
  return { txt: 'FPS ' + r, col }
}

// Nama tenant di strip dipangkas di batas kata (pola clip) — nama panjang
// tidak boleh memakan seluruh lebar strip dan mendorong segmen agen keluar.
export function clampStripTenant(name, max = 24) {
  const n = String(name || '')
  if (n.length <= max) return n
  const cut = n.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return (sp >= max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…'
}

// Wajib-segmen strip (label yang tidak boleh dibuang): label SaaS + status agen.
// stripLayout() memangkas segmen prioritas-rendah dari kanan sampai muat:
// urutan buang: 'terbaru: …' → '… pesan' → '… chat' → omniroute → online.
export const STRIP_GAP = 26, STRIP_LEFT = 44, STRIP_RIGHT = 44
// Siklus 535: segmen HOST (metrik nyata via hostRes) dibuang paling akhir —
// lebih penting dari 'terbaru'. BASE tanpa host: urutan lama utuh (test regresi).
export const BASE_DROP_ORDER = ['latest', 'messages', 'chats', 'online', 'host']
export const OMNI_DROP_ORDER = ['latest', 'messages', 'chats', 'omni', 'online', 'host']

export function stripLayout(snap, measure, hostRes = null) {
  const segs = stripSegments(snap, hostRes).map(sg => ({ ...sg }))
  const hasOmni = !!(snap && snap.omniroute)
  const dropOrder = hasOmni ? OMNI_DROP_ORDER : BASE_DROP_ORDER
  // tandai segmen yang boleh dibuang
  let inOmni = false
  segs.forEach(sg => {
    if (sg.txt.startsWith('terbaru: ')) sg.__drop = 'latest'
    else if (/ \d+ pesan$/.test(sg.txt)) sg.__drop = 'messages'
    else if (/ \d+ chat$/.test(sg.txt)) sg.__drop = 'chats'
    else if (sg.txt === 'online' && !inOmni && !sg.__isOmni) sg.__drop = 'online'
    else if (sg.txt === 'OMNI') {
      sg.__drop = 'omni'
      inOmni = true
    } else if (inOmni || sg.__isOmni) {
      sg.__drop = 'omni'
      inOmni = false
    }
  })
  // tandai pemisah '·' yang mendahului OMNI agar ikut terbuang saat OMNI dibuang
  for (let i = 0; i < segs.length - 1; i++) {
    if (segs[i].txt === '·' && segs[i + 1]?.__drop === 'omni') {
      segs[i].__drop = 'omni'
    }
  }
  const budget = measure.budget
  const gap = measure.gap ?? STRIP_GAP
  const width = (list) => list.reduce((a, s) => a + measure.text(s.txt) + gap, 0) - gap
  for (let i = 0; i <= dropOrder.length; i++) {
    const drops = new Set(dropOrder.slice(0, i))
    const kept = segs.filter(sg => !drops.has(sg.__drop))
    if (width(kept) <= budget) return { kept, dropped: [...drops] }
  }
  // tetap tak muat (layar sempit ekstrem): buang semua opsional + pangkas nama agen tidak mungkin — kembalikan minimal
  return { kept: segs.filter(sg => !sg.__drop), dropped: [...dropOrder] }
}
