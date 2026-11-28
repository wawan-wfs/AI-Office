import { describe, it, expect } from 'vitest'
import {
  computePct, clip, cardY, CARD_H, COLUMN_BOTTOM, subtitle, bannerParts, bannerNames, bannerLayout,
  columnItems, stripSegments, clampStripTenant, stripLayout, BASE_DROP_ORDER, OMNI_DROP_ORDER, STRIP_GAP,
  hostSegments, fpsSegment,
  normalizeTaskStatus, formatTaskId, formatCardStatus, formatCardTitle, cardMeta,
} from '../scene/parts/projectboard_data.js'

describe('cardY (tata letak kartu tidak menabrak strip bawah)', () => {
  it('6 kartu terakhir masih di dalam kolom', () => {
    const maxItems = columnItems({ recent: new Array(10).fill(0).map((_, i) => ({ id: i, status: 'done', title: 't' })) }, 2).length
    expect(maxItems).toBe(6)
    expect(cardY(maxItems - 1) + CARD_H).toBeLessThanOrEqual(COLUMN_BOTTOM)
  })
  it('kartu berurutan tanpa tumpang tindih', () => {
    expect(cardY(1) - cardY(0)).toBeGreaterThanOrEqual(CARD_H)
    expect(cardY(0)).toBe(248)
  })
})

describe('clip (judul kartu tanpa potong tengah kata)', () => {
  it('teks pendek tak diubah', () => {
    expect(clip('Admin dashboard', 30)).toBe('Admin dashboard')
    expect(clip('', 30)).toBe('')
    expect(clip(null, 30)).toBe('')
  })
  it('teks panjang dipotong di spasi + ellipsis', () => {
    const out = clip('Chat widget embeddable (Next.js)', 30)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBeLessThanOrEqual(31)
    expect(out).not.toMatch(/\w\.\.\.$/) // tak ada potongan kata seperti "(Next.j…"
    expect(out.endsWith('(Next.js…')).toBe(false)
  })
  it('tanpa spasi dekat batas: potong apa adanya + ellipsis', () => {
    const out = clip('Supercalifragilisticexpialidocious', 30)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBe(31)
  })
})

describe('computePct', () => {
  it('membulatkan done/total', () => {
    expect(computePct({ total: 23, done: 15 })).toBe(65)
    expect(computePct({ total: 3, done: 0 })).toBe(0)
    expect(computePct({ total: 4, done: 4 })).toBe(100)
  })
  it('0 bila tak ada total / T null', () => {
    expect(computePct({})).toBe(0)
    expect(computePct(null)).toBe(0)
  })
  it('dijepit ke 0–100 (done>total / negatif) & aman terhadap NaN', () => {
    expect(computePct({ total: 5, done: 12 })).toBe(100)
    expect(computePct({ total: 5, done: -3 })).toBe(0)
    expect(computePct({ total: 5, done: undefined })).toBe(0)
    expect(computePct({ total: 5, done: NaN })).toBe(0)
    expect(computePct({ total: 2, done: 1 })).toBe(50)
  })
})

describe('subtitle', () => {
  it('menyertakan review & gagal bila ada', () => {
    const s = subtitle({ review: 2, failed: 1 }, '10:00')
    expect(s).toContain('review 2')
    expect(s).toContain('gagal 1')
    expect(s).toContain('10:00')
  })
  it('bersih bila tidak ada masalah', () => {
    expect(subtitle({}, '10:00')).not.toContain('review')
  })
  it('siklus 270 — tanpa timeStr tidak menghasilkan trailing dot atau spasi gantung', () => {
    expect(subtitle({}, '')).toBe('Data live · task engine + SaaS')
    expect(subtitle({}, null)).toBe('Data live · task engine + SaaS')
    expect(subtitle({}, undefined)).toBe('Data live · task engine + SaaS')
  })
  it('siklus 270 — tanpa timeStr tetapi ada review/gagal terformat rapi tanpa double separator', () => {
    expect(subtitle({ review: 2 }, '')).toBe('Data live · task engine + SaaS · review 2')
    expect(subtitle({ failed: 1 }, null)).toBe('Data live · task engine + SaaS · gagal 1')
    expect(subtitle({ review: 1, failed: 3 }, '')).toBe('Data live · task engine + SaaS · review 1 · gagal 3')
  })
})

describe('bannerParts & bannerNames', () => {
  const T = { failed: 1, review: 2, recent: [
    { id: 7, title: 'task gagal', status: 'failed' },
    { id: 9, title: 'task review', status: 'review' },
  ] }
  it('parts: GAGAL merah, REVIEW biru, urut itu', () => {
    expect(bannerParts(T)).toEqual([['GAGAL 1', '#EF4444'], ['REVIEW 2', '#60A5FA']])
  })
  it('names: gabung prefix + daftar task terbaru (maks 3)', () => {
    const n = bannerNames(T)
    expect(n).toContain('GAGAL 1 · REVIEW 2')
    expect(n).toContain('#7 task gagal')
    expect(n).toContain('#9 task review')
  })
  it('null bila tidak ada failed/review atau recent kosong', () => {
    expect(bannerNames({ failed: 1, recent: [{ status: 'done' }] })).toBeNull()
    expect(bannerNames({})).toBeNull()
    expect(bannerNames(null)).toBeNull()
  })
})

describe('columnItems', () => {
  const T = { recent: [
    { id: 1, status: 'pending' }, { id: 2, status: 'running' }, { id: 3, status: 'done' },
    ...Array.from({ length: 8 }, (_, i) => ({ id: 10 + i, status: 'done' })),
  ] }
  it('filter per kolom & maks 6 item', () => {
    expect(columnItems(T, 0).map(r => r.id)).toEqual([1])
    expect(columnItems(T, 1).map(r => r.id)).toEqual([2])
    expect(columnItems(T, 2)).toHaveLength(6)
  })
  it('T null / tanpa recent → array kosong', () => {
    expect(columnItems(null, 2)).toEqual([])
    expect(columnItems({}, 0)).toEqual([])
  })
})

describe('bannerLayout (banner sadar-lebar, tidak meluber)', () => {
  const T = { failed: 1, review: 1, recent: [
    { id: 7, title: 'task gagal panjang sekali sekalian', status: 'failed' },
    { id: 9, title: 'task review lain', status: 'review' },
  ] }
  const m = (budget) => ({ budget, text: t => t.length * 10 })
  it('null bila tidak relevan', () => {
    expect(bannerLayout(null, m(5000))).toBeNull()
    expect(bannerLayout({ failed: 1, recent: [{ status: 'done' }] }, m(5000))).toBeNull()
  })
  it('muat → semua nama tampil utuh (tanpa slice(0,24))', () => {
    const L = bannerLayout(T, m(5000))
    expect(L.names).toHaveLength(2)
    expect(L.names[0]).toContain('panjang sekali sekalian')
    expect(L.truncated).toBe(false)
  })
  it('budget sempit → buang item dari belakang, head tetap', () => {
    const L = bannerLayout(T, m(900))
    expect(L.names).toHaveLength(1)
    expect(L.head).toContain('GAGAL')
    expect(L.truncated).toBe(true)
  })
  it('invariant: hasil muat dalam budget atau terpangkas di batas kata', () => {
    for (const b of [700, 900, 1100, 1400, 2000]) {
      const L = bannerLayout(T, m(b))
      const w = m(b).text(L.head) + m(b).text('—  ·  ') * L.names.length + L.names.reduce((a, t) => a + m(b).text(t), 0)
      expect(w).toBeLessThanOrEqual(b)
    }
  })
})

describe('stripSegments', () => {
  it('SaaS online: tenant/chat/pesan + agent Up/Down dengan simbol benar', () => {
    const segs = stripSegments({ saas: { online: true, stats: { tenants: 3, conversations: 12, messages: 40 }, tenants: [{ name: 'Budi' }] }, agents: [{ name: 'be1', status: 'Up' }, { name: 'qa1', status: 'Exited' }] })
    const texts = segs.map(s => s.txt)
    expect(texts).toContain('SaaS')
    expect(texts).toContain('3 tenant')
    expect(texts).toContain('12 chat')
    expect(texts).toContain('40 pesan')
    expect(texts).toContain('online')
    expect(texts).toContain('terbaru: Budi')
    expect(texts).toContain('be1 ●')
    expect(texts).toContain('qa1 ○')
  })
  it('siklus 535: nama agen panjang dipangkas di batas kata (maks 12 char)', () => {
    const segs = stripSegments({ agents: [{ name: 'sbx-proj-wfs-landing-3d-motion', status: 'Up' }] })
    const ag = segs.find(s => s.txt.endsWith('●'))
    expect(ag.txt.length).toBeLessThanOrEqual(15) // 12 + '…' + ' ●' = 15
    expect(ag.txt).toMatch(/…? ●$/)
    // nama pendek tak berubah
    const short = stripSegments({ agents: [{ name: 'be1', status: 'Up' }] })
    expect(short.find(s => s.txt.endsWith('●')).txt).toBe('be1 ●')
  })
  it('siklus 535: strip membatasi 3 agen + "+N lagi"', () => {
    const ags = ['a1','a2','a3','a4','a5','a6'].map(n => ({ name: n, status: 'Up' }))
    const texts = stripSegments({ agents: ags }).map(s => s.txt)
    expect(texts.filter(t => t.endsWith('●'))).toHaveLength(3)
    expect(texts).toContain('+3 lagi')
    expect(texts).not.toContain('a5 ●')
  })
  it('fallback tenants dari array bila stats.tenants hilang', () => {
    const segs = stripSegments({ saas: { online: true, tenants: [{}, {}, {}] } })
    expect(segs.map(s => s.txt)).toContain('3 tenant')
  })
  it('SaaS offline → segmen offline merah; agents tetap tampil', () => {
    const segs = stripSegments({ saas: { online: false }, agents: [{ name: 'fe1', status: 'Up' }] })
    const off = segs.find(s => s.txt === 'offline')
    expect(off.col).toBe('#EF4444')
    expect(segs.map(s => s.txt)).toContain('AGENT')
  })
  it('tanpa snapshot → minimal segmen offline', () => {
    const segs = stripSegments(null)
    expect(segs[0]).toEqual({ txt: 'SaaS', col: '#60A5FA' })
    expect(segs.map(s => s.txt)).toContain('offline')
    expect(segs.some(s => s.txt === 'AGENT')).toBe(false)
  })
  it('omniroute online/offline disertakan dengan port & status yang sesuai', () => {
    const segsOnline = stripSegments({
      saas: { online: true },
      agents: [],
      omniroute: { online: true, port: 20128 },
    })
    expect(segsOnline.map(s => s.txt)).toContain('OMNI')
    expect(segsOnline.map(s => s.txt)).toContain(':20128 ●')
    const omniSeg = segsOnline.find(s => s.txt === ':20128 ●')
    expect(omniSeg.col).toBe('#10E5A0')

    const segsOffline = stripSegments({
      saas: { online: true },
      agents: [],
      omniroute: { online: false },
    })
    expect(segsOffline.map(s => s.txt)).toContain('offline')
    const offOmni = segsOffline.find(s => s.txt === 'offline' && s.__isOmni)
    expect(offOmni.col).toBe('#EF4444')
  })
})

describe('hostSegments — metrik host nyata di strip papan (siklus 535)', () => {
  const HR = { load: 1.2, mem_total_mb: 7500, mem_available_mb: 2000, disk_used_gb: 25, disk_total_gb: 50 }
  it('host penuh: HOST + CPU/MEM/DISK dengan persen terhitung', () => {
    const segs = hostSegments(HR)
    expect(segs.map(s => s.txt)).toEqual(['HOST', 'CPU 12%', 'MEM 73%', 'LOAD 1.20', 'DISK 50%'])
    expect(segs[0].col).toBe('#60A5FA') // accent
    expect(segs[1].col).toBe('#10E5A0') // <75% ok
  })
  it('nilai tinggi memicu warna warn/err', () => {
    const segs = hostSegments({ ...HR, load: 8, mem_available_mb: 500 })
    const cpu = segs.find(s => s.txt.startsWith('CPU'))
    const mem = segs.find(s => s.txt.startsWith('MEM'))
    expect(cpu.txt).toBe('CPU 80%'); expect(cpu.col).toBe('#F59E0B') // warn (TASK_STATUS_COLORS.running)
    expect(mem.txt).toBe('MEM 93%'); expect(mem.col).toBe('#EF4444') // err
  })
  it('clamp 1..99: disk penuh tak pernah 100%', () => {
    const segs = hostSegments({ ...HR, disk_used_gb: 50 })
    expect(segs.find(s => s.txt.startsWith('DISK')).txt).toBe('DISK 99%')
  })
  it('nilai parsial: metrik non-finite dilewati tanpa NaN', () => {
    const segs = hostSegments({ load: 1, mem_total_mb: 'banyak', mem_available_mb: NaN, disk_total_gb: 0 })
    expect(segs.map(s => s.txt)).toEqual(['HOST', 'CPU 10%', 'LOAD 1.00'])
    expect(segs.every(s => !s.txt.includes('NaN'))).toBe(true)
  })
  it('hostRes null / bukan objek / kosong → [] (strip lama utuh)', () => {
    expect(hostSegments(null)).toEqual([])
    expect(hostSegments('x')).toEqual([])
    expect(hostSegments({})).toEqual([]) // hanya label tanpa metrik → kosong
  })
  it('siklus 546: LOAD avg 1-mnt sebagai metrik sendiri; warna tingkat & guard', () => {
    expect(hostSegments({ ...HR }).find(s => s.txt.startsWith('LOAD')).txt).toBe('LOAD 1.20')
    expect(hostSegments({ ...HR }).find(s => s.txt.startsWith('LOAD')).col).toBe('#10E5A0') // <2 ok
    expect(hostSegments({ ...HR, load: 3 }).find(s => s.txt.startsWith('LOAD')).col).toBe('#F59E0B') // 2..4 warn
    expect(hostSegments({ ...HR, load: 5 }).find(s => s.txt.startsWith('LOAD')).col).toBe('#EF4444') // ≥4 err
    expect(hostSegments({ mem_total_mb: 100, mem_available_mb: 50 }).find(s => s.txt.startsWith('LOAD'))).toBeUndefined()
    expect(hostSegments({ load: 'banyak' }).every(s => !s.txt.includes('NaN'))).toBe(true)
  })
  it('siklus 537: UP uptime — jam/menit, guard non-finite/≤0', () => {
    expect(hostSegments({ ...HR, uptime_s: 3600 * 5 + 120 }).find(s => s.txt.startsWith('UP')).txt).toBe('UP 5j')
    // Siklus 551: ≥1 hari → 'Nd' (live 40 hari sebelumnya salah '971j')
    expect(hostSegments({ ...HR, uptime_s: 3600 * 24 * 40 + 3600 }).find(s => s.txt.startsWith('UP')).txt).toBe('UP 40d')
    expect(hostSegments({ ...HR, uptime_s: 59 * 60 }).find(s => s.txt.startsWith('UP')).txt).toBe('UP 59m')
    expect(hostSegments({ ...HR, uptime_s: 0 }).find(s => s.txt.startsWith('UP'))).toBeUndefined()
    expect(hostSegments({ ...HR, uptime_s: NaN }).find(s => s.txt.startsWith('UP'))).toBeUndefined()
    expect(hostSegments({ uptime_s: -5 })).toEqual([])
  })
  it('siklus 545: CPU% sejati cpu_pct (bukan load*10), fallback & guard', () => {
    // cpu_pct valid → dipakai apa adanya (0 sah), BUKAN load*10
    expect(hostSegments({ ...HR, cpu_pct: 37.5 }).find(s => s.txt.startsWith('CPU')).txt).toBe('CPU 38%')
    expect(hostSegments({ ...HR, cpu_pct: 0, load: 9.9 }).find(s => s.txt.startsWith('CPU')).txt).toBe('CPU 1%')
    // cpu_pct tak valid → fallback load*10 (pola 532)
    expect(hostSegments({ ...HR, cpu_pct: NaN }).find(s => s.txt.startsWith('CPU')).txt).toBe('CPU 12%')
    expect(hostSegments({ ...HR, cpu_pct: 'banyak' }).find(s => s.txt.startsWith('CPU')).txt).toBe('CPU 12%')
    // dua-duanya tak valid → segmen CPU dilewati (tanpa 'CPU NaN%')
    expect(hostSegments({ cpu_pct: NaN, load: NaN }).find(s => s.txt.startsWith('CPU'))).toBeUndefined()
  })
  it('siklus 544: NET throughput nyata (rx+tx MB/s → M/K, guard)', () => {
    // ≥1 MB/s → 'N.NM' (toFixed 1 desimal)
    expect(hostSegments({ ...HR, net_rx_mb_s: 1.0, net_tx_mb_s: 0.2 }).find(s => s.txt.startsWith('NET')).txt).toBe('NET 1.2M')
    // <1 MB/s → KB bulat: (0.02+0.01)*1024 ≈ 30.7 → 31K
    expect(hostSegments({ ...HR, net_rx_mb_s: 0.02, net_tx_mb_s: 0.01 }).find(s => s.txt.startsWith('NET')).txt).toBe('NET 31K')
    // negatif di-clamp 0; 0 MB/s → 'NET 0K' (tetap segmen, bar trafik nol)
    expect(hostSegments({ ...HR, net_rx_mb_s: -1, net_tx_mb_s: 0 }).find(s => s.txt.startsWith('NET')).txt).toBe('NET 0K')
    // rx/tx tak valid → segmen dilewati (tanpa 'NET NaN')
    expect(hostSegments({ ...HR, net_rx_mb_s: NaN }).find(s => s.txt.startsWith('NET'))).toBeUndefined()
    expect(hostSegments({ ...HR, net_rx_mb_s: 'banyak', net_tx_mb_s: 0 }).find(s => s.txt.startsWith('NET'))).toBeUndefined()
  })
  it('siklus 550: AGEN count nyata di strip HOST; korup/hilang → tanpa segmen', () => {
    expect(hostSegments({ ...HR, agents: 15 }).find(s => s.txt.startsWith('AGEN')).txt).toBe('AGEN 15')
    // 8.7 dibulatkan (paritas footer sysdash 547)
    expect(hostSegments({ ...HR, agents: 8.7 }).find(s => s.txt.startsWith('AGEN')).txt).toBe('AGEN 9')
    // negatif / non-finite / hilang → segmen dilewati (tanpa 'AGEN NaN')
    expect(hostSegments({ ...HR, agents: -1 }).find(s => s.txt.startsWith('AGEN'))).toBeUndefined()
    expect(hostSegments({ ...HR, agents: NaN }).find(s => s.txt.startsWith('AGEN'))).toBeUndefined()
    expect(hostSegments({ ...HR }).find(s => s.txt.startsWith('AGEN'))).toBeUndefined()
  })
  it('siklus 552: CFG count (agen key kustom) di strip HOST; korup → tanpa segmen', () => {
    expect(hostSegments({ ...HR, custom_cfg: 3 }).find(s => s.txt.startsWith('CFG')).txt).toBe('CFG 3')
    // 2.6 dibulatkan; 0 tetap segmen (paritas NET 0K)
    expect(hostSegments({ ...HR, custom_cfg: 2.6 }).find(s => s.txt.startsWith('CFG')).txt).toBe('CFG 3')
    expect(hostSegments({ ...HR, custom_cfg: 0 }).find(s => s.txt.startsWith('CFG')).txt).toBe('CFG 0')
    // negatif / non-finite / hilang → segmen dilewati (tanpa 'CFG NaN')
    expect(hostSegments({ ...HR, custom_cfg: -1 }).find(s => s.txt.startsWith('CFG'))).toBeUndefined()
    expect(hostSegments({ ...HR, custom_cfg: NaN }).find(s => s.txt.startsWith('CFG'))).toBeUndefined()
    expect(hostSegments({ ...HR }).find(s => s.txt.startsWith('CFG'))).toBeUndefined()
  })
  it('stripSegments memasukkan segmen host; stripLayout membuang host paling akhir', () => {
    const snap = { saas: { online: true, stats: { tenants: 1, conversations: 1, messages: 1 } }, agents: [{ name: 'be1', status: 'Up' }] }
    const segs = stripSegments(snap, HR)
    expect(segs.map(s => s.txt)).toContain('CPU 12%')
    const { kept, dropped } = stripLayout(snap, { budget: 700, gap: 26, text: t => t.length * 10 }, HR)
    expect(dropped).toContain('host')
    expect(kept.some(s => s.txt === 'be1 ●')).toBe(true)
  })
})

describe('fpsSegment — FPS nyata papan proyek (siklus 540)', () => {
  it('57.4 → FPS 57 (ok), 20 → warn, 10 → err', () => {
    expect(fpsSegment(57.4)).toEqual({ txt: 'FPS 57', col: expect.any(String) })
    expect(fpsSegment(20)).toEqual({ txt: 'FPS 20', col: expect.any(String) })
    const ok = fpsSegment(60).col, warn = fpsSegment(20).col, err = fpsSegment(10).col
    expect(warn).not.toBe(ok)
    expect(err).not.toBe(ok)
    expect(err).not.toBe(warn)
  })
  it('non-finite → null (tanpa FPS NaN)', () => {
    expect(fpsSegment(NaN)).toBeNull()
    expect(fpsSegment(undefined)).toBeNull()
    expect(fpsSegment('x')).toBeNull()
    expect(fpsSegment(-Infinity)).toBeNull()
  })
  it('nilai negatif di-clamp 0 (tanpa FPS negatif)', () => {
    expect(fpsSegment(-5).txt).toBe('FPS 0')
  })
})

describe('clampStripTenant', () => {
  it('nama pendek utuh', () => {
    expect(clampStripTenant('Toko Berkah')).toBe('Toko Berkah')
  })
  it('nama panjang dipangkas di batas kata + …', () => {
    const c = clampStripTenant('Kopi Kenangan Sentral Raya Cabang Utama', 24)
    expect(c.length).toBeLessThanOrEqual(25)
    expect(c.endsWith('…')).toBe(true)
    expect(c.endsWith('Sentral…')).toBe(true) // tidak memotong tengah kata
  })
  it('kata tunggal sangat panjang → fallback potong', () => {
    const c = clampStripTenant('X'.repeat(40), 24)
    expect(c).toBe('X'.repeat(24) + '…')
  })
  it('guard falsy', () => {
    expect(clampStripTenant('')).toBe('')
    expect(clampStripTenant(null)).toBe('')
  })
})

describe('stripLayout', () => {
  const snap = { saas: { online: true, stats: { tenants: 3, conversations: 120, messages: 4560 }, tenants: [{ name: 'Toko Berkah Jaya Abadi Sentral' }] }, agents: [{ name: 'be1', status: 'Up' }, { name: 'fe1', status: 'Up' }] }
  // pengukur deterministik: 10px per karakter
  const m = (budget) => ({ budget, gap: 26, text: t => t.length * 10 })
  it('muat → semua segmen tampil, tak ada yang dibuang', () => {
    const { kept, dropped } = stripLayout(snap, m(5000))
    expect(kept.some(s => s.txt.startsWith('terbaru:'))).toBe(true)
    expect(dropped).toEqual([])
  })
  it('budget sempit → terbaru dibuang dulu, label SaaS & agen tetap', () => {
    const { kept, dropped } = stripLayout(snap, m(1073))
    expect(dropped).toContain('latest')
    expect(kept.some(s => s.txt.startsWith('terbaru:'))).toBe(false)
    expect(kept[0].txt).toBe('SaaS')
    expect(kept.map(s => s.txt)).toContain('AGENT')
  })
  it('budget sangat sempit → hanya segmen wajib (SaaS + agen)', () => {
    const { kept, dropped } = stripLayout(snap, m(400))
    // siklus 549: 'agmore' (+N lagi) kini opsional — ikut terbuang sebelum segmen wajib
    expect(dropped).toEqual(['latest', 'agmore', 'messages', 'chats', 'online', 'host'])
    expect(kept.every(s => !['latest', 'messages', 'chats', 'online'].includes(s.txt))).toBe(true)
    expect(kept.map(s => s.txt)).toContain('be1 ●')
  })
  it('invariant: lebar hasil selalu ≤ budget bila masih ada yang bisa dibuang', () => {
    for (const budget of [300, 700, 1000, 1400]) {
      const { kept } = stripLayout(snap, m(budget))
      const w = kept.reduce((a, s) => a + s.txt.length * 10 + 26, 0) - 26
      const mandatory = kept.filter(s => !['latest', 'messages', 'chats', 'online'].includes(s.txt))
      if (mandatory.reduce((a, s) => a + s.txt.length * 10 + 26, 0) - 26 <= budget) {
        expect(w).toBeLessThanOrEqual(budget)
      }
    }
  })
  it('omniroute tampil bila muat dan dibuang secara bertahap bila budget menyempit', () => {
    const snapOmni = {
      ...snap,
      omniroute: { online: true, port: 20128 },
    }
    const wide = stripLayout(snapOmni, m(5000))
    expect(wide.kept.some(s => s.txt === 'OMNI')).toBe(true)
    expect(wide.kept.some(s => s.txt === ':20128 ●')).toBe(true)
    expect(wide.dropped).toEqual([])

    // budget sangat ketat: omni dibuang sebelum agen
    const tight = stripLayout(snapOmni, m(400))
    expect(tight.dropped).toContain('omni')
    expect(tight.kept.some(s => s.txt === 'OMNI')).toBe(false)
    expect(tight.kept.some(s => s.txt === 'be1 ●')).toBe(true)
  })
})

describe('drop order — prioritas buang segmen strip', () => {
  it('BASE_DROP_ORDER: terbaru → +N lagi → pesan → chat → online → host', () => {
    expect(BASE_DROP_ORDER).toEqual(['latest', 'agmore', 'messages', 'chats', 'online', 'host'])
  })
  it('OMNI_DROP_ORDER menyisipkan omni sebelum online (omni dikorbankan dulu)', () => {
    expect(OMNI_DROP_ORDER).toEqual(['latest', 'agmore', 'messages', 'chats', 'omni', 'online', 'host'])
    // invariant: urutan BASE adalah prefix OMNI minus 'omni'
    const base = BASE_DROP_ORDER.filter(k => k !== 'omni' && k !== 'host')
    expect(base).toEqual(['latest', 'agmore', 'messages', 'chats', 'online'])
    expect(OMNI_DROP_ORDER.indexOf('omni')).toBeLessThan(OMNI_DROP_ORDER.indexOf('online'))
  })
  it('STRIP_GAP default 26px', () => {
    expect(STRIP_GAP).toBe(26)
  })
})

describe('normalizeTaskStatus & format helper kartu kanban 3D', () => {
  it('normalizeTaskStatus: memetakan alias status ke 4 kelompok baku', () => {
    expect(normalizeTaskStatus('completed')).toBe('done')
    expect(normalizeTaskStatus('finished')).toBe('done')
    expect(normalizeTaskStatus('resolved')).toBe('done')
    expect(normalizeTaskStatus('success')).toBe('done')
    expect(normalizeTaskStatus('DONE')).toBe('done')

    expect(normalizeTaskStatus('in_progress')).toBe('running')
    expect(normalizeTaskStatus('active')).toBe('running')
    expect(normalizeTaskStatus('working')).toBe('running')
    expect(normalizeTaskStatus('running')).toBe('running')

    expect(normalizeTaskStatus('ready')).toBe('pending')
    expect(normalizeTaskStatus('queued')).toBe('pending')
    expect(normalizeTaskStatus('waiting')).toBe('pending')
    expect(normalizeTaskStatus('todo')).toBe('pending')
    expect(normalizeTaskStatus('backlog')).toBe('pending')
    expect(normalizeTaskStatus('pending')).toBe('pending')
    expect(normalizeTaskStatus(null)).toBe('pending')
    expect(normalizeTaskStatus('')).toBe('pending')

    expect(normalizeTaskStatus('failed')).toBe('failed')
    expect(normalizeTaskStatus('error')).toBe('failed')
    expect(normalizeTaskStatus('review')).toBe('review')
    expect(normalizeTaskStatus('qa')).toBe('review')
  })

  it('formatTaskId: memformat ID berprefix task- maupun ID angka', () => {
    expect(formatTaskId('task-9da32873')).toBe('#9da32873')
    expect(formatTaskId('task-e8e731a4')).toBe('#e8e731a4')
    expect(formatTaskId(21)).toBe('#21')
    expect(formatTaskId('#42')).toBe('#42')
    expect(formatTaskId(null)).toBe('')
    expect(formatTaskId('')).toBe('')
  })

  it('formatCardStatus: teks status kartu kanban 3D', () => {
    expect(formatCardStatus('completed')).toBe('✓ selesai')
    expect(formatCardStatus('done')).toBe('✓ selesai')
    expect(formatCardStatus('running')).toBe('⚡ berjalan')
    expect(formatCardStatus('in_progress')).toBe('⚡ berjalan')
    expect(formatCardStatus('failed')).toBe('✕ gagal')
    expect(formatCardStatus('review')).toBe('🔍 review')
    expect(formatCardStatus('ready')).toBe('⏳ antri')
    expect(formatCardStatus('pending')).toBe('⏳ antri')
  })

  it('formatCardTitle: judul kartu dengan ID dan kliping rapi', () => {
    expect(formatCardTitle({ id: 'task-123', title: 'Belajar Tiga Dimensi' })).toBe('#123 Belajar Tiga Dimensi')
    expect(formatCardTitle({ id: 5, title: 'Short' })).toBe('#5 Short')
    expect(formatCardTitle(null)).toBe('')
  })

  it('cardMeta: menghasilkan metadata lengkap untuk render kanvas', () => {
    const metaDone = cardMeta({ id: 'task-abc', title: 'Fitur Utama', status: 'completed' })
    expect(metaDone.formattedId).toBe('#abc')
    expect(metaDone.statusKey).toBe('done')
    expect(metaDone.statusText).toBe('✓ selesai')
    expect(metaDone.statusColor).toBe('#10E5A0')

    const metaReady = cardMeta({ id: 'task-xyz', title: 'API Gateway', status: 'ready' })
    expect(metaReady.statusKey).toBe('pending')
    expect(metaReady.statusText).toBe('⏳ antri')
    expect(metaReady.statusColor).toBe('#9AA7B8')
    expect(cardMeta(null)).toBeNull()
  })

  it('columnItems mengelompokkan task server WFS yang berstatus ready dan completed', () => {
    const wfsSnapshot = {
      recent: [
        { id: 'task-9da32873', title: 'Develop: E-Commerce API', status: 'ready' },
        { id: 'task-e8e731a4', title: 'Develop: WFS Project 31A4', status: 'completed' },
        { id: 'task-67386a35', title: 'Develop: WFS TaskFlow SaaS', status: 'completed' },
        { id: 'task-9a927f44', title: 'Develop: E-Commerce API', status: 'ready' },
      ],
    }
    const antri = columnItems(wfsSnapshot, 0)
    const selesai = columnItems(wfsSnapshot, 2)
    expect(antri.map(t => t.id)).toEqual(['task-9da32873', 'task-9a927f44'])
    expect(selesai.map(t => t.id)).toEqual(['task-e8e731a4', 'task-67386a35'])
  })
})
