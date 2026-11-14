// label_status_dot.test.js — siklus 530: dot status label mengambang LIVE.
// Dulu dot label SELALU hijau (TASK_STATUS_COLORS.done hardcode di makeLabel)
// meski agen rapat/makan siang/berjalan/pulang. Kini warna delegasi
// labelStatusColor (label_spec.js) → STATUS_HEX (agent_status.js, satu sumber
// dgn agentLiveStatus/HUD siklus 140).
import { describe, it, expect } from 'vitest';
import { labelStatusColor } from '../scene/parts/label_spec.js';
import { STATUS_HEX } from '../scene/parts/agent_status.js';

describe('labelStatusColor — dot label mengikuti state agen (530)', () => {
  it('sitting → hijau work (paritas visual lama)', () => {
    expect(labelStatusColor({ state: 'sitting' })).toBe(STATUS_HEX.work);
    expect(STATUS_HEX.work).toBe('#10E5A0');
  });

  it('meeting → biru meet; offsite → abu dim; leaving → abu dim', () => {
    expect(labelStatusColor({ state: 'meeting' })).toBe(STATUS_HEX.meet);
    expect(labelStatusColor({ state: 'offsite' })).toBe(STATUS_HEX.dim);
    expect(labelStatusColor({ state: 'leaving' })).toBe(STATUS_HEX.dim);
  });

  it('lunch flag → amber (menang atas state walking_out)', () => {
    expect(labelStatusColor({ state: 'walking_out', lunch: 1 })).toBe(STATUS_HEX.lunch);
    expect(labelStatusColor({ state: 'walking_back', lunch: true })).toBe(STATUS_HEX.lunch);
  });

  it('walking_out/walking_back tanpa lunch → biru muda walk', () => {
    expect(labelStatusColor({ state: 'walking_out' })).toBe(STATUS_HEX.walk);
    expect(labelStatusColor({ state: 'walking_back' })).toBe(STATUS_HEX.walk);
  });

  it('guard: null/non-object/state korup → hijau netral (tanpa crash/dot hilang)', () => {
    expect(labelStatusColor(null)).toBe(STATUS_HEX.work);
    expect(labelStatusColor(undefined)).toBe(STATUS_HEX.work);
    expect(labelStatusColor('bukan objek')).toBe(STATUS_HEX.work);
    expect(labelStatusColor({ state: 42 })).toBe(STATUS_HEX.work);
    expect(labelStatusColor({})).toBe(STATUS_HEX.work);
  });

  it('warna delegasi satu sumber STATUS_HEX (bukan hex tersalin)', () => {
    const ad = { state: 'meeting' };
    expect(labelStatusColor(ad)).toBe(STATUS_HEX[ 'meet' ]);
  });
});
