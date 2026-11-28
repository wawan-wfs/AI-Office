// Guard 540: kontrak getAgentCompetency — domain/summary/tags WAJIB string & array string.
// Agen tanpa nama di AgentInspector jatuh ke fallback berbasis role; tag array tak boleh
// berisi nilai non-string (poisoning render JSX bila API mengirim bentuk tak sah).
import { describe, it, expect } from 'vitest';
import { getAgentCompetency, AGENT_COMPETENCIES } from '../scene/parts/agent_competencies.js';

const assertComp = (comp, ctx) => {
  expect(typeof comp.domain, `${ctx}: domain`).toBe('string');
  expect(comp.domain.length, `${ctx}: domain non-kosong`).toBeGreaterThan(0);
  expect(typeof comp.summary, `${ctx}: summary`).toBe('string');
  expect(Array.isArray(comp.tags), `${ctx}: tags array`).toBe(true);
  comp.tags.forEach((t) => expect(typeof t, `${ctx}: tag`).toBe('string'));
};

describe('guard 540 kompetensi agen satu bentuk sah', () => {
  it('semua entri statis AGENT_COMPETENCIES sah', () => {
    Object.entries(AGENT_COMPETENCIES).forEach(([k, v]) => assertComp(v, k));
  });

  it('fallback role non-string tetap string aman', () => {
    assertComp(getAgentCompetency({ role: { toxic: true } }), 'role-objek');
    assertComp(getAgentCompetency({ role: 42 }), 'role-angka');
    assertComp(getAgentCompetency(null), 'null');
    assertComp(getAgentCompetency({}), 'tanpa nama');
    assertComp(getAgentCompetency('  '), 'spasi');
  });

  it('nama tak terdaftar dgn prefix parsial tetap sah', () => {
    assertComp(getAgentCompetency('ARI'), 'prefix');
    assertComp(getAgentCompetency('AGENT-X-99'), 'tak dikenal');
    assertComp(getAgentCompetency('wahyu fs'), 'founder lowercase');
  });
});
