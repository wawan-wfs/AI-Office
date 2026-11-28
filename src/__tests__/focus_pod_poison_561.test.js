import { describe, it, expect } from 'vitest';
import { safeText } from '../scene/parts/nameplate_spec.js';

// Siklus 561: guard bubble fokus pod (focusTeam) — teks tim/floor harus via
// safeText; interpolasi mentah teamObj.name/teamObj.floor dilarang (paritas
// siklus 542 bubble sapaan SPAWN).

function buildBubbleText(name, floor) {
  return '\u201CPod ' + safeText(name) + ' (Lt. ' + safeText(floor) + ')\u201D';
}

describe('siklus 561 — bubble fokus pod anti-poisoning', () => {
  it('name objek/array/symbol tidak menghasilkan [object Object]', () => {
    expect(buildBubbleText({ a: 1 }, 3)).not.toContain('[object Object]');
    expect(buildBubbleText(['x'], 3)).not.toContain('[object Object]');
    expect(buildBubbleText(Symbol('s'), 3)).not.toContain('[object Object]');
  });

  it('floor non-string tetap tampil wajar', () => {
    expect(buildBubbleText('Backend', { f: 3 })).not.toContain('[object Object]');
    expect(buildBubbleText(null, null)).toContain('Pod');
  });

  it('anti-regresi: sumber tidak lagi memakai interpolasi mentah', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const src = readFileSync(fileURLToPath(
      new URL('../scene/OfficeScene.js', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/createBubble\(ft\.x[\s\S]{0,200}teamObj\.name \+/);
    expect(src).toContain('safeText(teamObj.name)');
    expect(src).toContain('safeText(teamObj.floor)');
  });
});
