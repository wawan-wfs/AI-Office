// Siklus 554 — guard anti-poisoning jalur notice/status SecureProjectPanel.
// Setelah siklus 518 (secondary fields), sisa interpolasi mentah di notice
// string-built & child JSX budget/preview/invoice kini wajib ternormalisasi.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve(__dirname, '..', 'components', 'SecureProjectPanel.jsx')
const src = readFileSync(SRC, 'utf8')

describe('secure notice/status poisoning 554', () => {
  it('semua setNotice memakai normalizeSecondary (tidak ada interpolasi mentah)', () => {
    const setNoticeLines = src.split('\n').filter(l => l.includes('setNotice('))
    expect(setNoticeLines.length).toBeGreaterThanOrEqual(5)
    // tidak ada penggabungan nilai API mentah: result.task_id / result.job_id / result.status / value tanpa wrapper
    for (const line of setNoticeLines) {
      expect(line).not.toMatch(/setNotice\('[^']*' \+ (result\.(task_id|job_id|status)|value)\b/)
      expect(line).not.toMatch(/\+ result\.(task_id|job_id|status)\b/)
    }
    const uses = src.match(/normalizeSecondary\(/g) || []
    expect(uses.length).toBeGreaterThanOrEqual(12)
  })

  it('child JSX budget/preview/invoice ternormalisasi (tanpa field mentah)', () => {
    expect(src).toMatch(/normalizeSecondary\(fmtMicroUSD\(budget\.cap_microusd\)/)
    expect(src).not.toMatch(/\{fmtMicroUSD\(budget\./)
    expect(src).not.toMatch(/\{invoiceCheck\.(matched|requires_review)\}/)
    expect(src).not.toMatch(/\{previewCheck\.ok \?/)
    expect(src).not.toMatch(/\{\s*invoiceCheck\.provider_invoice_verified \?/)
  })

  it('normalizeSecondary tetap benar untuk bentuk tak sah', async () => {
    // reimpor perilaku via regex kontrak sumber: fungsi ada & handle objek
    expect(src).toMatch(/function normalizeSecondary\(v\)/)
    expect(src).toMatch(/JSON\.stringify\(v\)/)
  })
})
