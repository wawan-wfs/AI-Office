// Guard siklus 527: kartu statistik angka Dashboard, stat Overview ShConsole,
// by-status v, presence, dan guard array state (d.tasks / stats.logs) — nilai
// bentuk sah non-string/objek dari API tak lagi jatuh sebagai React child
// mentah ('[object Object]' / crash child). Satu sumber normalizer (clip.js),
// pola seri 512-526.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeClipText } from '../lib/clip.js';

const root = resolve(__dirname, '..', '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

describe('siklus 527 — kartu & stat angka satu sumber normalizer', () => {
  it('kontrak normalizeClipText untuk angka kartu', () => {
    expect(normalizeClipText(12)).toBe('12');
    expect(normalizeClipText({ n: 1 })).toBe('{"n":1}');
    expect(normalizeClipText(undefined)).toBe('');
  });

  it('Dashboard: nilai card() & presence dinormalisasi, logs di-guard array', () => {
    const src = read('src/components/Dashboard.jsx');
    for (const f of ['stats.projects_total', 'stats.projects_running', 'stats.tasks_total', 'stats.tasks_running', 'stats.tasks_completed', 'stats.agents_count']) {
      expect(src).toMatch(new RegExp('normalizeClipText\\(' + f.replaceAll('.', '\\.')));
      expect(src).not.toMatch(new RegExp('\\{' + f.replaceAll('.', '\\.') + ' \\?\\?'));
    }
    expect(src).toMatch(/normalizeClipText\(tasks \? totalFiles : '—'\)/);
    expect(src).toMatch(/normalizeClipText\(presence\.total\)/);
    expect(src).toMatch(/normalizeClipText\(presence\.text\)/);
    expect(src).not.toMatch(/\{presence\.total\}/);
    expect(src).toMatch(/Array\.isArray\(stats\.logs\) \? stats\.logs : \[\]/);
    expect(src).not.toMatch(/\(stats\.logs \|\| \[\]\)/);
    expect(src).toMatch(/\.test\(normalizeClipText\(c\.name\)\)/);
  });

  it('ShConsole: stat overview & nilai by-status dinormalisasi, entries di-guard objek', () => {
    const src = read('src/components/ShConsole.jsx');
    for (const f of ['ov.projects', 'ov.tasks', 'ov.agents', 'ov.running_subtasks', 'ov.total_logs']) {
      expect(src).toMatch(new RegExp('normalizeClipText\\(' + f.replaceAll('.', '\\.') + '\\)'));
    }
    expect(src.match(/normalizeClipText\(v\)/g).length).toBeGreaterThanOrEqual(2);
    expect(src.match(/typeof ov\.task_by_status === 'object'/g).length).toBe(2);
    expect(src.match(/typeof ov\.agent_by_status === 'object'/g).length).toBe(1);
    expect(src).toMatch(/normalizeClipText\(live\)/);
  });

  it('TeamStats: state data di-guard array (d.tasks non-array → [])', () => {
    const src = read('src/components/TeamStats.jsx');
    expect(src).toMatch(/setData\(Array\.isArray\(d\.tasks\) \? d\.tasks : \[\]\)/);
    expect(src).not.toMatch(/setData\(d\.tasks \|\| \[\]\)/);
  });
});
