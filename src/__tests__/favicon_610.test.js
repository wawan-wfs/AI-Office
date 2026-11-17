import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { allAgents } from '../scene/parts/agents_spec.js';
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js';

const svg = readFileSync('public/favicon.svg', 'utf8');
const master = readFileSync('public/icon-master.svg', 'utf8');

describe('favicon 610 parity with honeycomb master', () => {
  it('favicon identical to icon-master.svg (single source of identity)', () => {
    expect(svg).toBe(master);
  });
  it('favicon has honeycomb structure: bg + 7 polygons + W initial', () => {
    expect(svg).toContain('#000C1E');
    expect((svg.match(/<polygon/g) || []).length).toBe(8);
    expect(svg).toContain('>W<');
    expect(svg).toContain('linearGradient');
  });
  it('agent count still 26', () => {
    expect(allAgents().length + EXTENDED_SPECIALISTS.length).toBe(26);
  });
});
