/**
 * Siklus 605 — App Badging API (PWA): badge jumlah task aktif di ikon dock.
 *
 * App.jsx sudah menghitung `pendingCount` = pending + review + failed tiap poll
 * (satu sumber refreshStatus). Angka itu kini juga tampil sebagai badge di ikon
 * aplikasi terpasang (Chrome/Edge desktop & Android, setAppBadge) — pengguna
 * melihat ada pekerjaan menunggu tanpa membuka tab, melengkapi judul tab
 * dinamis (● N jalan) dan deep-link PWA shortcuts (siklus 603).
 *
 * Kontrak manager (navigator disuntikkan, murni & teruji):
 *   - nav tanpa setAppBadge → 'unsupported', tanpa error, semua no-op.
 *   - set(n): n 1..Infinity → setAppBadge(clamp int ≥1); n ≤ 0/null → clear.
 *   - clear(): clearAppBadge + state 'cleared'. Idempoten: nilai sama tak
 *     dipanggil ulang (dock beberapa OS berkedip jika spam).
 *   - Anti-poisoning: bukan finite number → dianggap invalid → clear, bukan
 *     badge "NaN" atau "undefined" palsu.
 */

export function createAppBadgeManager(nav, { onState } = {}) {
  const supported = Boolean(nav && typeof nav.setAppBadge === 'function' && typeof nav.clearAppBadge === 'function')
  let last = null // null | number badge aktif

  const emit = () => { if (onState) onState(last === null ? 'cleared' : 'set', last) }
  if (!supported) {
    const st = 'unsupported'
    if (onState) onState(st)
    return {
      state: () => st,
      set: async () => st,
      clear: async () => st,
    }
  }

  async function set(n) {
    const num = typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : null
    if (num === null || num <= 0) return clear()
    const clamped = Math.max(1, num)
    if (last === clamped) return 'set' // idempoten — jangan spam dock
    await nav.setAppBadge(clamped)
    last = clamped
    emit()
    return 'set'
  }

  async function clear() {
    if (last !== null) {
      await nav.clearAppBadge()
      last = null
      emit()
    }
    return 'cleared'
  }

  function state() {
    return last === null ? 'cleared' : 'set'
  }
  function value() {
    return last
  }

  return { state, value, set, clear }
}
