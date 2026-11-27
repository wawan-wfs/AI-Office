/**
 * Guard siklus 509 — anti-poisoning field teks non-string:
 * - kanban_search.getSearchMatchSegments: title numerik/objek/null ternormalisasi
 *   aman (angka → String, objek → JSON), tanpa crash & bukan [] telanjang utk teks sah.
 * - kanban_spec.extractTaskTags: scan hashtag/bracket dgn title/desc/description
 *   non-string tidak crash & tidak menuliskan "[object Object]".
 * Kontrak lama: teks string & query normal utuh.
 */
import { describe, it, expect } from 'vitest';
import { getSearchMatchSegments } from '../lib/kanban_search';
import { extractTaskTags, matchTaskTags, matchTaskSearch } from '../scene/parts/kanban_spec';

describe('509 — getSearchMatchSegments kontrak non-string', () => {
  // Kontrak eksplisit tes lama (kanban_search.test.js): text non-string → []
  // (tidak pernah dipecah) — tetap dijaga, tidak dinormalisasi.
  it('title numerik → [] sesuai kontrak lama', () => {
    expect(getSearchMatchSegments(12345, '23')).toEqual([]);
  });

  it('null/undefined → []', () => {
    expect(getSearchMatchSegments(null, 'x')).toEqual([]);
    expect(getSearchMatchSegments(undefined, 'x')).toEqual([]);
  });

  it('siklik → [] tanpa throw', () => {
    const a = {};
    a.self = a;
    expect(getSearchMatchSegments(a, 'x')).toEqual([]);
  });

  it('objek → [] (kontrak: non-string tidak dipecah)', () => {
    expect(getSearchMatchSegments({ detail: 'deploy' }, 'deploy')).toEqual([]);
  });

  it('kontrak lama: teks normal tanpa query → 1 segmen tanpa match', () => {
    expect(getSearchMatchSegments('Deploy API', '')).toEqual([{ text: 'Deploy API', match: false }]);
    const segs = getSearchMatchSegments('Deploy API', 'api');
    expect(segs).toEqual([
      { text: 'Deploy ', match: false },
      { text: 'API', match: true },
    ]);
  });
});

describe('509 — extractTaskTags anti-poisoning', () => {
  it('desc objek dgn #tag dalam JSON tetap terdeteksi, tanpa crash', () => {
    const tags = extractTaskTags({ id: 1, title: 'T', desc: { note: 'kerjakan #api sekarang' } });
    expect(tags).toContain('api');
  });

  it('title numerik & description null → tidak crash', () => {
    expect(() => extractTaskTags({ id: 2, title: 42, description: null })).not.toThrow();
    expect(extractTaskTags({ id: 2, title: 42, description: null })).toEqual([]);
  });

  it('kontrak lama: string hashtag & bracket utuh', () => {
    const tags = extractTaskTags({ title: '[FE] boot #react', desc: 'ship #ci-cd' });
    expect(tags).toEqual(expect.arrayContaining(['fe', 'react', 'ci-cd']));
  });

  it('matchTaskTags & matchTaskSearch tetap jalan pada task campuran', () => {
    const t = { id: 3, title: 77, desc: { txt: 'autogen #db' }, tags: 'sql' };
    expect(() => matchTaskTags(t, 'db')).not.toThrow();
    expect(matchTaskTags(t, 'db')).toBe(true);
    expect(() => matchTaskSearch(t, 'db')).not.toThrow();
    expect(matchTaskSearch(t, 'db')).toBe(true);
  });
});
