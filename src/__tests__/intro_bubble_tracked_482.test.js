import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Siklus 482: bubble intro OfficeScene tak lagi setTimeout telanjang.
// Dulu `setTimeout(()=>createBubble(...), 1200)` dijalankan SEBELUM array
// pelacak __timeouts dideklarasikan → id tak pernah di-clear di destroy →
// remount/HMR dalam 1,2 dtk pertama membiarkan callback menembak graph scene
// mati. Kini id masuk __timeouts → clearTimeout di destroy (pola pollStatus
// siklus 124). Tes membaca sumber nyata via matchAll (pola guard 481).

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = readFileSync(join(here, '..', 'scene', 'OfficeScene.js'), 'utf8')

const setTimeoutCalls = (src) => [...src.matchAll(/setTimeout\s*\(/g)]

describe('siklus 482 — bubble intro dilacak __timeouts', () => {
  it('pemanggilan setTimeout untuk bubble intro ada DI DALAM blok yang meng-push ke __timeouts', () => {
    // Pola baris baru: __timeouts.push(setTimeout(()=>{ ... createBubble( ...
    const tracked = /__timeouts\.push\(\s*setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]{0,300}?createBubble\(/.test(SRC)
    expect(tracked, 'bubble intro harus dibungkus __timeouts.push(setTimeout(...))').toBe(true)
  })

  it('tidak ada setTimeout telanjang utk createBubble lagi (pola lama dihapus)', () => {
    // Pola lama: `setTimeout(()=>{ ...createBubble(...)... },1200)` TANPA push pelacak.
    const naked = [...SRC.matchAll(/(?<!__timeouts\.push\(\s*)setTimeout\(\s*\(\)\s*=>\s*\{\s*try\s*\{[\s\S]{0,200}?createBubble/g)]
    expect(naked, 'setTimeout createBubble telanjang tidak boleh tersisa').toHaveLength(0)
  })

  it('delay intro tetap 1200 ms (perilaku tampilan tak berubah)', () => {
    const m = SRC.match(/__timeouts\.push\(\s*setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]{0,300}?\},\s*(\d+)\s*\)/)
    expect(m && m[1]).toBe('1200')
  })

  it('urutan benar: deklarasi __timeouts mendahului setTimeout bubble intro', () => {
    const decl = SRC.indexOf('const __timeouts=[]')
    const intro = SRC.indexOf('__timeouts.push(setTimeout(')
    expect(decl).toBeGreaterThan(-1)
    expect(intro).toBeGreaterThan(decl)
    // destroy masih me-clear semua timeout terlacak
    expect(SRC).toContain('__timeouts.forEach(clearTimeout)')
  })
})
