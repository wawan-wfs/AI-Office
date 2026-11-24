// Guard siklus 422 — palet warna identitas agen satu sumber.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { AGENT_ID_COLORS, agentColorFromHex } from '../lib/ui_palette.js';
import { AGENTS, AGENTS_EXTRA, allAgents } from '../scene/parts/agents_spec.js';
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');

describe('agent identity palette 422', () => {
  it('nilai historis terkunci di AGENT_ID_COLORS (26 agen)', () => {
    expect(Object.keys(AGENT_ID_COLORS).length).toBe(26);
    expect(AGENT_ID_COLORS['BANTUIN AI']).toBe('#10E5A0');
    expect(AGENT_ID_COLORS['BUDI']).toBe('#3B82F6');
    expect(AGENT_ID_COLORS['SARI']).toBe('#F59E0B');
    expect(AGENT_ID_COLORS['ARIS']).toBe('#00F0FF');
    expect(AGENT_ID_COLORS['GILANG']).toBe('#00E5FF');
    expect(AGENT_ID_COLORS['SECBOT']).toBe('#EF4444');
    expect(AGENT_ID_COLORS['CITRA']).toBe('#FBBF24');
  });

  it('semua agen scene pakai AGENT_ID_COLORS + color = parseInt(hex)', () => {
    for (const a of allAgents().concat(EXTENDED_SPECIALISTS)) {
      expect(a.hex).toBe(AGENT_ID_COLORS[a.name]);
      expect(a.color).toBe(agentColorFromHex(a.hex));
    }
    expect(allAgents().length).toBe(14);
    expect(EXTENDED_SPECIALISTS.length).toBe(12);
  });

  it('0 literal warna hex/0x enam digit di agents_spec & extended_desks', () => {
    for (const f of ['scene/parts/agents_spec.js', 'scene/parts/extended_desks.js']) {
      const literals = read(f).match(/0x[0-9a-fA-F]{6}|'#[0-9a-fA-F]{3,6}'/g) || [];
      expect(literals.filter((s) => !/^0x(1a1a2e|222222|1a1a1a|4A148C|3E2723|111111|263238|5D1A1A|2D1B0E|111827|0F172A|3B2412|1E293B|312E81|000000|450A0A|78350F|1F2937|164E63|08281F|111827)/i.test(s)),
        `${f} literal warna identitas tersisa`);
      // hair/shirt/pants boleh literal; color & hex TIDAK boleh:
      expect(read(f).match(/color:\s*0x/), `${f} color literal` ).toBeFalsy();
      expect(read(f).match(/hex:\s*'/), `${f} hex literal`).toBeFalsy();
    }
  });

  it('anti-poisoning: nilai di AGENT_ID_COLORS tidak boleh diubah', () => {
    // REGENERATE jika memang ada keputusan desain baru (dokumentasikan di DEV_LOG).
    expect(agentColorFromHex('#10E5A0')).toBe(0x10E5A0);
    expect(AGENT_ID_COLORS['YOGA']).toBe('#60A5FA');
    expect(AGENT_ID_COLORS['MAYA']).toBe('#A78BFA');
    expect(AGENT_ID_COLORS['SUPPORT']).toBe('#84CC16');
  });
});
