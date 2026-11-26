// Siklus 507: anti-poisoning ekspor Kanban (CSV & JSON) — field non-string
// (bentuk sah API: judul numerik, deskripsi objek, agent_id angka) dulu bocor
// sebagai [object Object] / nilai mentah tanpa konteks ke berkas ekspor.
import { describe, it, expect } from 'vitest';
import {
  formatCsvCell,
  formatCsvRow,
  buildTaskCsv,
  buildTaskJson,
} from '../lib/kanban_export.js';

describe('siklus 507 — ekspor anti-poisoning field non-string', () => {
  it('formatCsvCell: objek → JSON, primitive → String, null → kosong', () => {
    expect(formatCsvCell({ a: 1 })).toBe('"{""a"":1}"');
    expect(formatCsvCell([1, 'x'])).toBe('"[1,""x""]"');
    expect(formatCsvCell(42)).toBe('42');
    expect(formatCsvCell(null)).toBe('');
    expect(formatCsvCell(undefined)).toBe('');
    // Kontrak escape lama utuh
    expect(formatCsvCell('a,"b"')).toBe('"a,""b"""');
    expect(formatCsvCell('baris\nbaru')).toBe('"baris\nbaru"');
  });

  it('formatCsvRow: array campuran tak pernah berisi [object Object]', () => {
    const row = formatCsvRow([1, { t: 'x' }, 'ok', null]);
    expect(row).toBe('1,"{""t"":""x""}",ok,');
    expect(row).not.toContain('[object Object]');
  });

  it('buildTaskCsv: task dgn field non-string diekspor tanpa [object Object]', () => {
    const tasks = [
      { id: 1, title: 123, status: 'pending', priority: null, description: { text: 'halo' }, role: 'dev' },
      { id: 2, title: 'normal', status: 'done' },
      null,
      'bukan-object',
    ];
    const csv = buildTaskCsv(tasks);
    expect(csv).not.toContain('[object Object]');
    expect(csv).toContain('123');
    expect(csv).toContain('"halo"'); // JSON objek terbungkus escape CSV
  });

  it('buildTaskJson: field non-string dinormalisasi jadi string aman', () => {
    const res = buildTaskJson([
      { id: 7, title: 99, status: 'pending', desc: { x: 1 }, agent_id: 3 },
    ]);
    const t = res.tasks[0];
    expect(t.id).toBe(7);
    expect(t.title).toBe('99');
    expect(t.description).toBe('{"x":1}');
    expect(t.agent_id).toBe('3');
  });
});
