// Guard 553: jalur flash/toast lintas komponen WAJIB dinormalisasi —
// field API bentuk sah non-string (id objek, label kolom objek, task_id objek)
// tak boleh jatuh sebagai '[object Object]' di toast aria-live global.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeClipText } from '../lib/clip.js';
import { formatDragDropNotification } from '../lib/kanban_drag.js';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

describe('guard 553 flash/toast anti-poisoning', () => {
  it('kontrak normalizeClipText bentuk sah', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}');
    expect(normalizeClipText(undefined)).toBe('');
    expect(normalizeClipText(3)).toBe('3');
    expect(normalizeClipText('ok')).toBe('ok');
  });

  it('formatDragDropNotification aman untuk id & label non-string', () => {
    const msg = formatDragDropNotification({ id: { toxic: true } }, 'done', { toString: null, label: 'x' });
    expect(msg).not.toContain('[object Object]');
    expect(msg).toContain('"toxic":true');
    expect(formatDragDropNotification({ id: 7 }, 'done', 'Selesai')).toBe('Task #7 dipindahkan ke kolom Selesai');
    expect(formatDragDropNotification(null, 'done')).toBe('');
  });

  it('pemanggilan flash di komponen dinormalisasi (regex)', () => {
    const tb = read('src/components/TaskBoard.jsx');
    expect(tb).not.toMatch(/onFlash\(`Task #\$\{t\.id\}/);
    expect(tb).not.toMatch(/onFlash\(`Gagal memindahkan task #\$\{task\.id\}/);
    const tm = read('src/components/TaskModal.jsx');
    expect(tm).not.toMatch(/Task #\$\{d\.task_id\}/);
    const app = read('src/App.jsx');
    expect(app).not.toMatch(/flash\(`Task #\$\{x\.id\}/);
    expect(app).toMatch(/normText\(toast\.msg\)/);
    const kd = read('src/lib/kanban_drag.js');
    expect(kd).toMatch(/normalizeClipText\(colLabel/);
  });
});
