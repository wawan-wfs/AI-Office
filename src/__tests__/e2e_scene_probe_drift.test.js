import { statSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// Siklus 560 — probe scene E2E pindah ke repo (scripts/e2e_scene_probe.py).
// Dulu hidup di cache scratch /tmp (mudah ter-prune, sudah dua kali hilang);
// kini ter-track git agar alat verifikasi scene tidak hilang antar-siklus.
const here = fileURLToPath(new URL('.', import.meta.url))
const PROBE = resolve(here, '../../scripts/e2e_scene_probe.py')

describe('e2e_scene_probe — alat verifikasi scene di repo (siklus 560)', () => {
  it('scripts/e2e_scene_probe.py ada & executable', () => {
    const st = statSync(PROBE)
    expect(st.isFile()).toBe(true)
    expect(st.mode & 0o111).not.toBe(0)
  })

  it('kontrak alat: URL default :9503/?e2e=1, chromium swiftshader, pesan gagal standar', () => {
    const s = readFileSync(PROBE, 'utf-8')
    expect(s).toContain('http://127.0.0.1:9503/?e2e=1')
    expect(s).toContain('--use-gl=angle')
    expect(s).toContain('enable-unsafe-swiftshader')
    expect(s).toContain('Scene init failed')
  })
})
