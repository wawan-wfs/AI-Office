// Siklus 512 — anti-poisoning field sekunder task di TaskBoard.
// agent_id / role / status / prompt / result non-string (bentuk sah API:
// numerik atau objek) tidak boleh crash render atau tampil "[object Object]".
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const boardSrc = readFileSync(join(process.cwd(), 'src/components/TaskBoard.jsx'), 'utf8');

// Replika helper satu-sumber di TaskBoard (sinkron dgn siklus 512).
const normalizeSecondary = (v) => (v == null || v === '' ? '' : typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : (() => { try { return JSON.stringify(v) } catch { return '' } })());

describe('siklus 512 — normalizeSecondary TaskBoard', () => {
  it('agent_id numerik → string, bukan crash', () => {
    expect(normalizeSecondary(42)).toBe('42');
  });

  it("agent_id null/undefined/kosong → string kosong (fallback label tetap jalan)", () => {
    expect(normalizeSecondary(null)).toBe('');
    expect(normalizeSecondary(undefined)).toBe('');
    expect(normalizeSecondary('')).toBe('');
    expect(normalizeSecondary(null) || 'unassigned').toBe('unassigned');
  });

  it('prompt/result objek → JSON, bukan [object Object]', () => {
    const out = normalizeSecondary({ steps: 3, mode: 'auto' });
    expect(out).toContain('"steps"');
    expect(out).not.toContain('[object Object]');
  });

  it("objek siklik → string kosong tanpa crash", () => {
    const a = {}; a.self = a;
    expect(normalizeSecondary(a)).toBe('');
  });

  it('string utuh tak berubah', () => {
    expect(normalizeSecondary('AG-01')).toBe('AG-01');
  });
});

describe('siklus 512 — TaskBoard membungkus field sekunder', () => {
  it('render detail/kartu tanpa field sekunder mentah', () => {
    // sel.detail agent_id/role/status/prompt/result dibungkus normalizeSecondary
    expect(boardSrc).toContain('normalizeSecondary(sel.agent_id)');
    expect(boardSrc).toContain('normalizeSecondary(sel.role)');
    expect(boardSrc).toContain('normalizeSecondary(sel.status)');
    expect(boardSrc).toContain('normalizeSecondary(detail?.prompt ?? sel.prompt)');
    expect(boardSrc).toContain('normalizeSecondary(detail?.result ?? sel.result)');
    // kartu list & kanban
    expect(boardSrc).toContain('normalizeSecondary(t.agent_id)');
    expect(boardSrc).toContain('normalizeSecondary(t.status)');
  });
});
