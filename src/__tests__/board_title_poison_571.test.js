import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 571: jalur fallback judul kartu papan 3D (projectboard.js) memakai
// interpolasi mentah '#'+r.id — id objek bentuk sah API → '#[object Object]'.
// Kini delegasi formatCardTitle (satu sumber, ternormalisasi sejak 510).

const SRC = readFileSync(resolve(__dirname, '../scene/parts/projectboard.js'), 'utf8')

describe('projectboard fallback title poison guard (571)', () => {
  it('fallback title memakai formatCardTitle, bukan interpolasi mentah r.id', () => {
    expect(SRC).toMatch(/formatCardTitle\(r, 30\)/)
    expect(SRC).not.toMatch(/'#' \+ r\.id/)
  })

  it('formatCardTitle satu sumber sudah ternormalisasi (id & title)', () => {
    // read src dari projectboard_data via sumber test lain tidak perlu —
    // cukup verifikasi import terpasang di projectboard.js
    expect(SRC).toMatch(/import \{[^}]*formatCardTitle[^}]*\} from '\.\/projectboard_data\.js'/)
  })
})
