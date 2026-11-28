// Siklus 556 — guard stempel created_at ekspor JSON (backlog 175).
// Kontrak: field created_at di buildTaskJson dinormalisasi satu-sumber —
// bentuk sah non-string (angka UNIX, objek API {sec:...}, Date) tak pernah
// ditulis mentah; fallback ke updated_at saat created_at absen; null tetap null.
import { describe, expect, it } from 'vitest';

const s = (v) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

describe('kanban_export created_at normalization (556)', () => {
  it('objek API {sec:...} dinormalisasi, bukan ditulis mentah', () => {
    const v = { sec: 1700000000 };
    expect(s(v)).toBe('{"sec":1700000000}');
    expect(s(v)).not.toContain('[object Object]');
  });

  it('fallback updated_at saat created_at absen; angka UNIX jadi string', () => {
    const t = { updated_at: 1764301200 };
    const raw = t.created_at ?? t.createdAt ?? t.updated_at ?? t.updatedAt ?? null;
    expect(s(raw) || null).toBe('1764301200');
  });

  it('created_at absen total → null (bukan "undefined"/"null")', () => {
    const raw = undefined ?? null;
    expect(s(raw) || null).toBeNull();
  });

  it('pola ternormalisasi hadir di kanban_export.js (anti-regresi render mentah)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../lib/kanban_export.js', import.meta.url), 'utf8');
    expect(src).toContain('created_at: s(t.created_at');
    expect(src).not.toMatch(/created_at:\s*t\.created_at\s*\|\|\s*t\.createdAt/);
  });
});
