// Guard siklus 481 — sinkronisasi SCENE_HOOKS vs assignment window.__* nyata.
//
// Konteks siklus 123/476: setiap `window.__x = …` milik scene 3D HARUS
// terdaftar di scene_hooks.js agar purge destroy() menghapusnya — hook yang
// lolos menunjuk graph scene mati pasca-remount (heap terkunci, probe E2E
// membaca scene lama). Sebaliknya, nama di daftar yang tak pernah di-assign
// adalah dead entry yang menyesatkan pembaca/probe.
//
// Tes ini memindai sumber nyata (src/**, tanpa tests) — bukan daftar manual —
// sehingga hook baru yang lupa didaftarkan atau sisa daftar basi langsung
// FAIL dengan pesan yang menyebut persis nama yang harus ditambah/dihapus.
// Pemilik non-scene (App.jsx & lib, dibuang pemiliknya masing-masing) dikecualikan
// dengan daftar eksplisit yang paralel dengan komentar scene_hooks.js.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { SCENE_HOOKS } from '../scene/parts/scene_hooks.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Pemilik non-scene — JANGAN didaftarkan di SCENE_HOOKS (paralel komentar
// "PEMILIK LAIN" di scene_hooks.js; __swUpdateDebug dibuang dispose() lib,
// siklus 476; __officeSceneDestroyed sengaja persist lintas-scene).
const NON_SCENE_OWNERS = new Set([
  '__wfsAgentIdList', '__wfsSceneSelect', '__wfsSelectAgent',
  '__wfsModalOpen', '__wfsAppModalBase', '__escModalAtDispatch',
  '__openSettings', '__officeSceneDestroyed', '__swUpdateDebug',
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '__tests__' || name === 'dist') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(name) && !/\.test\.|\.spec\./.test(name)) out.push(p);
  }
  return out;
}

function collectAssignedHooks() {
  const assigned = new Set();
  for (const f of walk(ROOT)) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/window\.(__[A-Za-z0-9_]+)\s*=/g)) assigned.add(m[1]);
  }
  return assigned;
}

describe('SCENE_HOOKS sinkron assignment window.__* (siklus 481)', () => {
  const assigned = collectAssignedHooks();
  const listed = new Set(SCENE_HOOKS);

  it('semua hook scene yang di-assign terdaftar di SCENE_HOOKS', () => {
    const missing = [...assigned].filter((h) => !listed.has(h) && !NON_SCENE_OWNERS.has(h));
    expect(missing, `hook window scene TAK terdaftar (tambahkan ke scene_hooks.js): ${missing.join(', ')}`).toEqual([]);
  });

  it('tidak ada dead entry: nama di SCENE_HOOKS memang pernah di-assign', () => {
    const dead = SCENE_HOOKS.filter((h) => !assigned.has(h));
    expect(dead, `SCENE_HOOKS memuat nama tak pernah di-assign (hapus dari scene_hooks.js): ${dead.join(', ')}`).toEqual([]);
  });

  it('daftar pemilik non-scene tak bocor masuk SCENE_HOOKS', () => {
    const leaked = SCENE_HOOKS.filter((h) => NON_SCENE_OWNERS.has(h));
    expect(leaked, `pemilik non-scene bocor ke purge scene: ${leaked.join(', ')}`).toEqual([]);
  });

  it('sensus sumber tidak kosong (guard tak diam saat glob gagal)', () => {
    expect(assigned.size).toBeGreaterThan(30);
    expect(SCENE_HOOKS.length).toBeGreaterThan(60);
  });
});
