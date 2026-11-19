import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { AGENT_ID_SCENE_PAIRS } from '../../src/scene/parts/agent_identity.js';

const html = () => readFileSync('public/landing.html', 'utf8');

describe('landing_stats_truth_628', () => {
  it('h1 tidak lagi mengklaim angka agen spesifik', () => {
    const h1 = html().match(/<h1[^>]*>[\s\S]*?<\/h1>/)[0];
    expect(h1).not.toMatch(/\b26\b/);
    expect(h1).not.toMatch(/26 Agen/);
    expect(h1).toMatch(/Tim Agen AI/);
  });
  it('stat agen memakai angka paritas avatar scene (26 tanpa founder)', () => {
    const avatarCount = AGENT_ID_SCENE_PAIRS.filter(([id]) => id !== 'ceo').length;
    expect(avatarCount).toBe(26);
    expect(html()).toMatch(new RegExp(`<b lang="id">${avatarCount}</b><span lang="id">Agen di kantor 3D</span>`));
  });
  it('angka 26 hanya di stat avatar & meta (fallback s-proj = "—" (632))', () => {
    const t = html();
    expect(t).toContain('id="s-proj" lang="id">—');
    const h1 = t.match(/<h1[^>]*>[\s\S]*?<\/h1>/)[0];
    expect(h1).not.toMatch(/\b26\b/);
  });
});
