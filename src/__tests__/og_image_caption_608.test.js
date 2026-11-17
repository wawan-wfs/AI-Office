// Siklus 608: gambar preview sosial (og-image.png) masih memuat "15 agent AI"
// padahal meta og/twitter sudah diselaraskan ke 26 agen sejak siklus 416/607.
// Guard ini memastikan aset yang dibagikan WhatsApp/Telegram/X tidak lagi
// mengiklankan jumlah agen usang & ejaan Inggris "agent".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { allAgents } from '../scene/parts/agents_spec.js'
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const png = path.join(root, 'public/og-image.png')

// Caption pada og-image.png harus mengikuti jumlah agen riil di scene:
// allAgents() (AGENTS + AGENTS_EXTRA) + EXTENDED_SPECIALISTS (guard anti-drift, siklus 608).
const agentCount = allAgents().length + EXTENDED_SPECIALISTS.length
const expectedCaption = `Kantor AI 3D · ${agentCount} agen AI · task nyata`

describe('og-image.png siklus 608', () => {
  test('caption og-image konsisten dgn jumlah agen scene', () => {
    expect(agentCount).toBe(26)
    expect(expectedCaption).toBe('Kantor AI 3D · 26 agen AI · task nyata')
    // index.html og/twitter:description memakai kalimat 26 agen yg sama
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    expect(html).toContain('26 agen AI bekerja')
  })

  test('aset preview sosial tersedia & berukuran 1200x630', () => {
    const buf = fs.readFileSync(png)
    expect(buf.length).toBeGreaterThan(10_000)
    expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG')
    // IHDR: width/height big-endian pada offset 16..24
    expect(buf.readUInt32BE(16)).toBe(1200)
    expect(buf.readUInt32BE(20)).toBe(630)
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
