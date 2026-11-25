// Papan proyek nyata WFS PROJECT di dinding kantor.
// Menggantikan kanban statis: kartu diambil dari data task engine sungguhan via /wfs-project,
// diperbarui otomatis setiap 60 detik. Jika fetch gagal → fallback ke data terakhir.
// Modul murni-canvas; dipasang di OfficeScene dengan satu pemanggilan.

import { computePct, clip, cardY, CARD_H, subtitle as subLine, bannerParts, bannerLayout, columnItems, cardMeta, stripLayout, fpsSegment, STRIP_GAP, STRIP_LEFT, STRIP_RIGHT } from './projectboard_data.js'
import { applyPollResult, connectionBadge, nextPollDelay, POLL_SCENE_HEALTHY_MS, CONN_TICK_MS } from '../../lib/connection_spec.js'
import { fetchWithTimeout } from '../../lib/fetch_timeout.js'
import { parseTimestampMs } from '../../lib/kanban_date.js'
import { fmtStampId } from '../../lib/format_time.js'
import { uiTexture, uiMaterial } from './ui_colorspace.js'
import { TASK_STATUS_COLORS } from '../../lib/task_status_colors.js';
import { SCENE_MUTED, PB_BG, PB_FOOT, PB_FRAME, PB_COL_BG, PB_CARD, NOTE_TEXT as PB_TXT_SOFT, PB_PENDING, PURE_TEXT, whiteAlpha, failedAlpha, PB_FRAME_3D } from '../../lib/ui_palette.js'

// Polling adaptif papan 3D: cadence sehat 60 dtk (POLL_SCENE_HEALTHY_MS satu
// sumber, siklus 375 — dulu konstanta lokal BOARD_POLL_HEALTHY_MS), tapi
// saat fetch gagal jeda mengikuti backoff eksponensial 5→10→20→40→80s (cap 80s)
// dari connection_spec — browser tak lagi menghantam gateway mati tiap 60 dtk.

export function createProjectBoard(office, THREE) {
  // --- kanvas papan ---
  const W = 1536, H = 840
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const g = cv.getContext('2d')

  // Siklus 386: warna status kanvas delegasi TASK_STATUS_COLORS (satu sumber).
  const C = TASK_STATUS_COLORS
  const tex = uiTexture(new THREE.CanvasTexture(cv))
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.04), uiMaterial(new THREE.MeshBasicMaterial({ map: tex, fog: false })))
  mesh.position.set(-8.35, 2.6, 13.3)
  mesh.rotation.y = Math.PI
  mesh.renderOrder = 5
  office.add(mesh)
  // bingkai elegan (mengelilingi papan proyek secara presisi, tidak menabrak dinding samping)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(7.65, 4.25, .05), new THREE.MeshLambertMaterial({ color: PB_FRAME_3D }))
  frame.position.set(-8.35, 2.6, 13.28)
  frame.userData.__keep = 1 // jangan ikut fade dinding belakang (wallFade collect)
  office.add(frame)

  // --- data ---
  let snap = null
  let lastOk = 0
  // Tracker kesehatan koneksi gateway — paritas dengan chip HUD (.conn-chip):
  // live / stale (data basi tapi papan masih layak) / down (belum pernah sukses).
  let conn = applyPollResult(null, { ok: false, error: 'init' }, 0)

  function roundRect(x, y, w, h, r) {
    g.beginPath()
    g.moveTo(x + r, y)
    g.arcTo(x + w, y, x + w, y + h, r)
    g.arcTo(x + w, y + h, x, y + h, r)
    g.arcTo(x, y + h, x, y, r)
    g.arcTo(x, y, x + w, y, r)
    g.closePath()
  }

  function draw() {
    if (!snap) return
    const T = snap.tasks || {}
    const pct = computePct(T)

    // latar
    g.fillStyle = PB_BG; g.fillRect(0, 0, W, H)
    g.strokeStyle = PB_FRAME; g.lineWidth = 4; g.strokeRect(6, 6, W - 12, H - 12)

    // judul
    g.fillStyle = C.done
    g.font = 'bold 52px sans-serif'; g.textAlign = 'left'
    g.fillText('WFS PROJECT: SOFTWARE HOUSE', 36, 66)
    g.fillStyle = SCENE_MUTED; g.font = '30px sans-serif'
    const stampTs = snapshotStamp()
    let sub = subLine(T, stampTs != null ? (fmtStampId(stampTs) ?? '') : '')
    g.fillText(sub, 36, 112)

    // progress bar
    g.fillStyle = whiteAlpha(.08); roundRect(36, 132, W - 72, 28, 10); g.fill()
    const grd = g.createLinearGradient(36, 0, W - 36, 0)
    grd.addColorStop(0, C.done); grd.addColorStop(1, C.review)
    g.fillStyle = grd; roundRect(36, 132, Math.max(12, (W - 72) * pct / 100), 28, 10); g.fill()
    g.fillStyle = PURE_TEXT; g.font = 'bold 26px sans-serif'; g.textAlign = 'right'
    g.fillText(pct + '% selesai', W - 40, 154)

    // banner review/gagal: task yang butuh perhatian tidak boleh tak terlihat
    if (T.failed || T.review) {
      const parts = bannerParts(T)
      const full = bannerLayout(T, { budget: W - 88, text: t => g.measureText(t).width })
      if (full) {
        g.font = 'bold 24px sans-serif'
        const nameStr = full.names.join('  ·  ')
        const bw = g.measureText(parts.map(p => p[0]).join(' · ') + ' — ').width + g.measureText('  ·  ').width * (full.names.length - 1) + g.measureText(nameStr).width + 44
        g.fillStyle = failedAlpha(.12); roundRect((W - bw) / 2, 166, bw, 34, 8); g.fill()
        g.strokeStyle = failedAlpha(.5); g.lineWidth = 2; roundRect((W - bw) / 2, 166, bw, 34, 8); g.stroke()
        g.textAlign = 'left'
        let tx = (W - bw) / 2 + 22
        parts.forEach(([txt, col]) => {
          g.fillStyle = col; g.fillText(txt, tx, 190); tx += g.measureText(txt).width + 14
        })
        g.fillStyle = PB_TXT_SOFT; g.font = '600 24px sans-serif'
        full.names.forEach((nm, i) => {
          if (i > 0) { tx += g.measureText('  ·  ').width; g.fillText('  ·  ', tx, 190); tx += g.measureText('  ·  ').width }
          g.fillText(nm, tx, 190); tx += g.measureText(nm).width
        })
        g.textAlign = 'left'
      }
    }

    // tiga kolom: Antri / Jalan / Selesai
    const cols = [
      ['ANTRI', PB_PENDING, T.pending || 0],
      ['JALAN', C.running, T.running || 0],
      ['SELESAI', C.done, T.done || 0],
    ]
    cols.forEach(([t, c, n], i) => {
      const x = 34 + i * 496
      g.fillStyle = PB_COL_BG; roundRect(x, 210, 470, 578, 12); g.fill()
      g.fillStyle = c; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'
      g.fillText(t + ' (' + n + ')', x + 235, 238)

      // kartu task nyata per status (dari recent) — 6 kartu pas di dalam kolom (tanpa ketiban strip bawah)
      const items = columnItems(T, i)
      items.forEach((r, ri) => {
        const y = cardY(ri)
        const meta = cardMeta(r)
        const cardCol = meta ? meta.statusColor : c
        // kartu: latar gelap solid + border warna status + teks putih terang (kontras tinggi)
        g.fillStyle = PB_CARD; roundRect(x + 22, y, 426, CARD_H, 10); g.fill()
        g.strokeStyle = cardCol; g.lineWidth = 4; roundRect(x + 22, y, 426, CARD_H, 10); g.stroke()
        g.fillStyle = PURE_TEXT
        g.font = '600 26px sans-serif'; g.textAlign = 'left'
        const title = meta ? meta.formattedTitle : ('#' + r.id + ' ' + clip((r.title || ''), 30))
        g.fillText(title, x + 44, y + 33, 392)
        g.fillStyle = cardCol; g.font = '600 22px sans-serif'
        const stText = meta ? meta.statusText : (r.status === 'done' ? '✓ selesai' : r.status)
        g.fillText(stText, x + 44, y + 63)
      })
      if (!items.length) {
        g.fillStyle = whiteAlpha(.25); g.font = '26px sans-serif'; g.textAlign = 'center'
        g.fillText(i === 2 ? 'semua beres' : 'kosong', x + 235, 320)
      }
    })
    // strip bawah: live SaaS bantuin + agent docker (band latar + divider)
    g.fillStyle = PB_FOOT; roundRect(20, 794, W - 40, 32, 8); g.fill()
    g.strokeStyle = PB_FRAME; g.lineWidth = 2; roundRect(20, 794, W - 40, 32, 8); g.stroke()
    g.font = '22px sans-serif'; g.textAlign = 'left'
    // layout strip sadar-lebar: buang segmen prioritas-rendah bila total melebihi
    // lebar strip (diukur dengan font sungguhan) — agen tak perlu terdorong keluar
    g.font = '22px sans-serif'
    const layout = stripLayout(snap, {
      budget: W - STRIP_LEFT - STRIP_RIGHT - 26,
      gap: STRIP_GAP,
      text: t => g.measureText(t).width,
    }, (typeof window !== 'undefined' && window.__hostRes) || null)
    g.font = '22px sans-serif'; g.textAlign = 'left'
    let sx = STRIP_LEFT
    // Siklus 540 — segmen FPS nyata (window.__fps, paritas sysdash 539):
    // digambar pertama setelah badge, tak pernah ikut dibuang stripLayout.
    const fpsSeg = fpsSegment(typeof window !== 'undefined' ? window.__fps : null)
    if (fpsSeg) {
      g.fillStyle = fpsSeg.col
      g.fillText(fpsSeg.txt, sx, 817)
      sx += g.measureText(fpsSeg.txt).width + STRIP_GAP
    }
    // Badge koneksi gateway (paritas chip HUD .conn-chip): titik berwarna + label
    // di awal strip, prioritas tertinggi (tak pernah ikut dibuang stripLayout).
    const cb = connectionBadge(conn)
    const dotCol = cb.tone === 'ok' ? C.done : cb.tone === 'warn' ? C.running : C.failed
    g.fillStyle = dotCol
    g.beginPath(); g.arc(sx + 6, 810, 5, 0, Math.PI * 2); g.fill()
    sx += 18
    g.fillStyle = cb.tone === 'ok' ? SCENE_MUTED : dotCol
    g.fillText(cb.label, sx, 817)
    sx += g.measureText(cb.label).width + STRIP_GAP
    layout.kept.forEach(sg => { g.fillStyle = sg.col; g.fillText(sg.txt, sx, 817); sx += g.measureText(sg.txt).width + STRIP_GAP })
    tex.needsUpdate = true
  }

  // Siklus 535: snapshot host NYATA untuk segmen strip HOST. Saat papan
  // menggambar (pull/tick), __hostRes poll terpisah 20 dtk (pollStatus) —
  // bila ada perubahan host, papan repaint murah (draw() penuh).
  let hostResKey = ''
  function hostKey(hr) {
    if (!hr || typeof hr !== 'object') return ''
    const n = (v) => (Number.isFinite(+v) ? +v : '?')
    // Siklus 553 — agents & custom_cfg ikut kunci: segmen AGEN/CFG (550/552)
    // digambar dari field ini, tapi dulu tidak ada di hostKey → perubahan
    // jumlah agen tidak memicu repaint strip HOST sampai field lain berubah.
    return [n(hr.load), n(hr.cpu_pct), n(hr.mem_total_mb), n(hr.mem_available_mb), n(hr.disk_used_gb), n(hr.disk_total_gb), n(hr.uptime_s), n(hr.agents), n(hr.custom_cfg)].join(',')
  }
  function drawIfHostChanged() {
    const k = hostKey(typeof window !== 'undefined' ? window.__hostRes : null)
    if (k !== hostResKey) { hostResKey = k; draw() }
  }
  // Siklus 470: tick repaint HOST strip gerbang visibility — tab hidden tak
  // repaint (data tetap segar via pull saat visible; pasca-visible tick
  // berikutnya menggambar ulang bila hostKey berubah).
  const hostIv = setInterval(() => { if (document.visibilityState === 'hidden') return; drawIfHostChanged() }, 20000)
  // Polling adaptif: rantai setTimeout — delay dari tracker (60 dtk sehat,
  // backoff eksponensial 5→80s saat gateway mati, pulih → 60 dtk lagi).
  // Jadwal pertama menyusul pull awal selesai, agar delay dihitung dari tracker segar.
  let pollTimer = null
  let pollStopped = false
  // Siklus 270 — stempel subjudul "Data live · … · HH.MM.SS" ANTI-POISONING:
  // snapshot d.at (dibangun server/gateway) diparsing via parseTimestampMs
  // (null/NaN/±Inf/'invalid'/Date NaN → NULL, detik-UNIX auto ×1000),
  // fallback ke lastOk (wall-clock saat poll sukses). Dulu `new Date(lastOk)`
  // mengabaikan d.at & `new Date('invalid')` kelas 269 melukis "Invalid Date".
  function snapshotStamp() {
    return parseTimestampMs(snap?.at) ?? (lastOk > 0 ? lastOk : null)
  }
  function schedulePoll() {
    pollTimer = setTimeout(async () => {
      await pull()
      if (!pollStopped) schedulePoll()
    }, nextPollDelay(conn, POLL_SCENE_HEALTHY_MS))
  }
  async function pull() {
    if (document.visibilityState === 'hidden') return
    if (pollStopped) return // destroy sudah jalan (remount/HMR) — jangan mulai siklus baru
    try {
      const r = await fetchWithTimeout('/wfs-project')
      // Siklus 125: scene bisa dimusnahkan selama fetch berjalan (remount/HMR).
      // Dulu await selesai SETELAH purge destroy → draw() menggambar canvas papan
      // scene mati + tracker koneksi terus di-update (pola bug sama dgn tvPull,
      // terdeteksi probe e2e_async_destroy: intercept fetch → destroy → resolve).
      if (pollStopped) return
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const d = await r.json()
      if (pollStopped) return // guard kedua: await json juga bisa kejar scene mati
      if (d && d.tasks) { snap = d; lastOk = Date.now() }
      conn = applyPollResult(conn, { ok: true })
      draw()
    } catch {
      if (pollStopped) return // guard catch: error fetch tidak boleh menyentuh scene mati
      conn = applyPollResult(conn, { ok: false, error: 'offline' })
      draw() // segarkan strip segera: badge koneksi berubah tanpa menunggu tick 60 dtk
    }
  }
  pull().then(() => { if (!pollStopped) schedulePoll() })
  // Umur data pada badge koneksi (label "Sinkron N dtk/mnt lalu" saat stale)
  // harus berdetak: segarkan strip tiap 30s. draw() menggambar hanya bila snap ada,
  // jadi aman sebelum fetch pertama berhasil.
  // Siklus 469: tick repaint gerbang visibility — tab hidden tak repaint
  // (dulu connIv + forceVisible tetap jalan 30 dtk/0,5 dtk di latar). Saat tab
  // kembali visible, pull() (onVis) menggambar ulang penuh → tak ada data basi.
  const connIv = setInterval(() => { if (document.visibilityState === 'hidden') return; if (conn.state !== 'live') draw() }, CONN_TICK_MS)
  // Tab kembali terlihat → segarkan data segera (jangan tunggu tick 60 detik);
  // tab hidden → interval tick di-skip agar tidak fetch sia-sia.
  let pageHidden = document.visibilityState === 'hidden'
  function onVis() {
    const hidden = document.visibilityState === 'hidden'
    if (!hidden && pageHidden) pull()
    pageHidden = hidden
  }
  document.addEventListener('visibilitychange', onVis)

  // Siklus 470: TANPA interval 500ms — dulu forceVisible jalan tiap 0,5 dtk
  // walau visible (hanya utk latch + cek opacity), kedip CPU sia-sia. Kini
  // event-driven: latch pageHidden di onVis (satu listener dgn refresh poll),
  // pasca-visible satu repaint dijamin + opacity dipulihkan sekali.
  function restoreFullVisible() {
    if (mesh.material.opacity !== undefined && mesh.material.opacity < 1) {
      mesh.material.opacity = 1
      mesh.material.transparent = false
      mesh.visible = true
    }
  }
  restoreFullVisible()
  let __visHidden = document.visibilityState === 'hidden';
  function onVisLatch() {
    const hidden = document.visibilityState === 'hidden'
    if (hidden) { __visHidden = true; return }
    if (__visHidden) { __visHidden = false; restoreFullVisible() } // latch: satu repaint pasca-visible
  }
  document.addEventListener('visibilitychange', onVisLatch)

  function destroy() {
    pollStopped = true // hentikan rantai poll adaptif
    if (pollTimer !== null) clearTimeout(pollTimer)
    clearInterval(connIv); clearInterval(hostIv); document.removeEventListener('visibilitychange', onVis)
    document.removeEventListener('visibilitychange', onVisLatch) // siklus 470
  }
  return { destroy, refresh: pull, mesh, frame }
}
