// Siklus 564 — ANTI-POISONING ringkasan filter: formatDivisionFilterSummary
// (kanban_spec) & formatDateRangeSummary (kanban_date) menyisipkan preset.label /
// icon / count MENTAH. Bentuk sah non-string (objek dari localStorage/API,
// count NaN) → '[object Object]' di chip/title TaskBoard.
import { describe, it, expect } from 'vitest';
import { formatDivisionFilterSummary } from '../scene/parts/kanban_spec.js';
import { formatDateRangeSummary } from '../lib/kanban_date.js';

describe('564 filter summary anti-poisoning', () => {
  it('division preset label/icon objek → JSON, bukan [object Object]', () => {
    const out = formatDivisionFilterSummary('div-x', [
      { key: 'div-x', label: { evil: 1 }, icon: { i: 1 }, divisions: ['eng', 'qa'] },
    ]);
    expect(out).toBe('{"i":1} {"evil":1} (2 divisi)');
    expect(out).not.toContain('[object Object]');
  });

  it('division preset normal tidak berubah', () => {
    const out = formatDivisionFilterSummary('div-x', [
      { key: 'div-x', label: 'Tim Kustom', icon: '🚀', divisions: ['eng'] },
    ]);
    expect(out).toBe('🚀 Tim Kustom (1 divisi)');
  });

  it('divisions.length non-number → fallback 0 divisi, tanpa crash', () => {
    // normalizeCustomDivPreset menolak preset tanpa divisions valid (normalizeDivisionList
    // null → ['all'] → difilter kosong → preset null) → fallback jalur list, bukan crash.
    const out = formatDivisionFilterSummary('div-x', [
      { key: 'div-x', label: 'A', icon: '🏢', divisions: null },
    ]);
    expect(out).toBe('div-x');
  });

  it('date range label/count objek → JSON, builtin label utuh', () => {
    expect(formatDateRangeSummary('today', { c: 1 })).toBe('Rentang: Hari Ini ({"c":1} task)');
    expect(formatDateRangeSummary('today', 5)).toBe('Rentang: Hari Ini (5 task)');
    expect(formatDateRangeSummary('today', null)).toBe('Rentang: Hari Ini');
    expect(formatDateRangeSummary('today', NaN)).not.toContain('[object Object]');
  });

  it('anti-regresi: pola sumber wajib ternormalisasi', () => {
    const spec = require('node:fs').readFileSync(
      new URL('../scene/parts/kanban_spec.js', import.meta.url), 'utf8'
    );
    expect(spec).toContain('normalizeClipText(preset.label)');
    const date = require('node:fs').readFileSync(
      new URL('../lib/kanban_date.js', import.meta.url), 'utf8'
    );
    expect(date).toContain('normalizeClipText(preset.label)');
  });
});
