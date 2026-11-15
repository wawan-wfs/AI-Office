import { describe, it, expect } from 'vitest';
import { hostSegments } from '../scene/parts/projectboard_data.js';
describe('load segmen', () => {
  it('load string -> segmen CPU', () => {
    const s = hostSegments({ load: '1.20', mem_total_mb: 1000, mem_available_mb: 500, disk_used_gb: 10, disk_total_gb: 50 });
    expect(s.some(x => x.txt.includes('CPU'))).toBe(true);
  });
  it('load korup -> tanpa CPU tanpa NaN', () => {
    const s = hostSegments({ load: 'banyak' });
    expect(s.every(x => !/NaN/.test(x.label))).toBe(true);
  });
});
