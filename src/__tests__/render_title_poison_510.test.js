// Guard siklus 510 — judul/deskripsi task non-string (bentuk sah API: title
// numerik, desc objek) TIDAK boleh dirender mentah sebagai React child
// ("Objects are not valid as a React child" crash) maupun tampil sebagai
// "[object Object]" di bubble dialog 3D / kartu papan proyek / log.
// Semua titik render kini melewati normalizeClipText (satu sumber clip.js).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeClipText } from '../lib/clip.js';
import { formatCardTitle, cardMeta, bannerNames, bannerLayout } from '../scene/parts/projectboard_data.js';
import { autoTalkText, clampBubbleText } from '../scene/parts/dialog.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const compsDir = join(root, 'components');

const RAW_TITLE_RE = /\{\s*(?:getSearchMatchSegments\()?\s*(?:x|t|task|sel|activeTask|run|p)\.title\s*[,}\)]/;

describe('siklus 510 — rendering task.title wajib lewat normalizeClipText', () => {
  const files = readdirSync(compsDir).filter((f) => f.endsWith('.jsx'));
  const offenders = [];
  for (const f of files) {
    const src = readFileSync(join(compsDir, f), 'utf8');
    for (const [i, line] of src.split('\n').entries()) {
      if (RAW_TITLE_RE.test(line) && !line.includes('normalizeClipText')) {
        offenders.push(`${f}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    }
  }
  it('tidak ada render t.title/x.title mentah di komponen', () => {
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('setiap file berisi render title mengimpor normalizeClipText', () => {
    for (const f of files) {
      const src = readFileSync(join(compsDir, f), 'utf8');
      if (/\.title/.test(src) && /normalizeClipText\(/.test(src) === false) {
        // file menyentuh .title tapi tak pernah menormalkan → hanya boleh bila
        // tak pernah me-render field title task (mis. OverlayHelp STEPS statis)
        if (/task|Task/.test(src) && /t\.title|x\.title|sel\.title|activeTask\.title/.test(src)) {
          throw new Error(`${f} me-render title task tanpa normalizeClipText`);
        }
      }
    }
    expect(true).toBe(true);
  });
});

describe('siklus 510 — normalizeClipText kontrak anti-poisoning', () => {
  it('objek → JSON (bukan "[object Object]")', () => {
    const r = normalizeClipText({ a: 1 });
    expect(r).toBe('{"a":1}');
    expect(r).not.toContain('[object Object]');
  });
  it('null/undefined → string kosong', () => {
    expect(normalizeClipText(null)).toBe('');
    expect(normalizeClipText(undefined)).toBe('');
  });
  it('angka → string', () => {
    expect(normalizeClipText(42)).toBe('42');
  });
  it('string utuh tak berubah', () => {
    expect(normalizeClipText('Deploy API')).toBe('Deploy API');
  });
  it('siklik → string kosong tanpa crash', () => {
    const cyc = {}; cyc.self = cyc;
    expect(normalizeClipText(cyc)).toBe('');
  });
});

describe('siklus 510 — konsumen scene aman terhadap title objek', () => {
  const task = { id: 'task-1', title: { text: 'Deploy' }, status: 'running' };

  it('formatCardTitle JSON, bukan [object Object]', () => {
    expect(formatCardTitle(task, 30)).toContain('{"text":"Deploy"}');
    expect(formatCardTitle(task, 30)).not.toContain('[object Object]');
  });
  it('cardMeta.title dinormalisasi', () => {
    expect(cardMeta(task).title).toBe('{"text":"Deploy"}');
  });
  it('bannerNames aman dengan title objek', () => {
    const T = { failed: 1, review: 0, recent: [{ id: 9, title: { x: 1 }, status: 'failed' }] };
    const out = bannerNames(T);
    expect(out).toContain('{"x":1}');
    expect(out).not.toContain('[object Object]');
  });
  it('bannerLayout aman dengan title objek', () => {
    const T = { failed: 1, review: 0, recent: [{ id: 9, title: { x: 1 }, status: 'failed' }] };
    const measure = { budget: 400, text: (t) => t.length };
    const out = bannerLayout(T, measure);
    expect(out.names.join(' ')).toContain('{"x":1}');
    expect(out.names.join(' ')).not.toContain('[object Object]');
  });
  it('autoTalkText bubble JSON, bukan [object Object]', () => {
    const ad = { agent: { name: 'Coder', role: 'Backend' } };
    const rt = { byAgent: { CODER01: { id: 7, title: { a: 2 } } } };
    const text = autoTalkText(ad, rt, { Coder: 'CODER01' });
    expect(text).toContain('{"a":2}');
    expect(text).not.toContain('[object Object]');
  });
  it('clampBubbleText kontrak lama utuh utk string', () => {
    expect(clampBubbleText('short')).toBe('short');
    expect(clampBubbleText('a'.repeat(40))).toBe('a'.repeat(31) + '…');
  });
});
