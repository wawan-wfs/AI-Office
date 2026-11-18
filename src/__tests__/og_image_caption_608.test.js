// Siklus 608: gambar preview sosial (og-image.png) masih memuat "15 agent AI"
// padahal meta og/twitter sudah diselaraskan ke 26 agen sejak siklus 416/607.
// Guard ini memastikan aset yang dibagikan WhatsApp/Telegram/X tidak lagi
// mengiklankan jumlah agen usang & ejaan Inggris "agent".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const png = path.join(root, 'public/og-image.png')

// Siklus 630: caption og-image tak lagi menyebut angka spesifik "26 agen AI"
// (paritas dengan meta landing/index sejak 627-629 yang memakai "tim agen AI").
const expectedCaption = 'Kantor AI 3D · Tim agen AI · task nyata'

describe('og-image.png siklus 608/630', () => {
  test('caption og-image tanpa klaim jumlah agen spesifik', () => {
    expect(expectedCaption).toBe('Kantor AI 3D · Tim agen AI · task nyata')
    // Siklus 629: index.html og/twitter:description kini "tim agen AI" (tanpa angka spesifik)
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    expect(html).toContain('tim agen AI bekerja')
    expect(html).not.toMatch(/og:description" content="[^"]*\b26\b/)
  })

  test('aset preview sosial tersedia & berukuran 1200x630', () => {
    const buf = fs.readFileSync(png)
    expect(buf.length).toBeGreaterThan(10_000)
    expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG')
    // IHDR: width/height big-endian pada offset 16..24
    expect(buf.readUInt32BE(16)).toBe(1200)
    expect(buf.readUInt32BE(20)).toBe(630)
  })

  test('guard kontrak 630: caption meta tidak menyebut "26 agen"', () => {
    // meta HTML tetap bebas angka; caption PNG kini konstanta tanpa interpolasi
    const landing = fs.readFileSync(path.join(root, 'public/landing.html'), 'utf8')
    expect(landing).not.toMatch(/og:description" content="[^"]*\b26\b/)
    expect(landing).toContain('tim agen AI')
  })

  test('tidak ada teks usang "15 agent AI" tersemat di PNG', () => {
    const buf = fs.readFileSync(png).toString('latin1')
    expect(buf).not.toMatch(/15\s?(agent|agen)/gi)
    expect(buf).not.toMatch(/\bagent\b/gi)
    // chunk tekstual (tEXt/iTXt) tak boleh membawa caption usang apa pun
    const chunks = buf.match(/tEXt[\s\S]*?\x00/i)
    if (chunks) expect(chunks[0]).not.toMatch(/15\s?(agent|agen)/gi)
  })
})
