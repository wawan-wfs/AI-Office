// Siklus 542: guard kontrak teks bubble chat — objek/array bentuk sah API
// tidak boleh jadi '[object Object]' di bubble kanvas (drawBubble default,
// clampBubbleText dialog, dan teks sapaan OfficeScene via safeText).
import { describe, it, expect } from 'vitest';
import { drawBubble } from '../scene/parts/bubble_canvas.js';
import { clampBubbleText } from '../scene/parts/dialog.js';
import { safeText } from '../scene/parts/nameplate_spec.js';

const POISON = [{ to: 'xic' }, ['arr'], 'ok', 42, null, undefined];

function stubCtx() {
  const texts = [];
  const noop = () => {};
  return {
    texts,
    fillText: (t) => texts.push(String(t)),
    beginPath: noop, moveTo: noop, lineTo: noop, quadraticCurveTo: noop,
    closePath: noop, fill: noop, stroke: noop,
  };
}

describe('bubble text poisoning guard (542)', () => {
  it('safeText kontrak: objek/array → "", angka/boolean di-stringify', () => {
    expect(safeText({})).toBe('');
    expect(safeText(['x'])).toBe('');
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
    expect(safeText(42)).toBe('42');
    expect(safeText(true)).toBe('true');
    expect(safeText('Budi')).toBe('Budi');
  });

  it('clampBubbleText tidak menghasilkan [object Object]', () => {
    for (const p of POISON) expect(clampBubbleText(p)).not.toContain('object Object');
    expect(clampBubbleText({})).toBe('');
    expect(clampBubbleText('Aku mengerjakan task penting hari ini')).toContain('…');
  });

  it('drawBubble default clamp: stub ctx tanpa [object Object] untuk 6 bentuk', () => {
    for (const p of POISON) {
      const ctx = stubCtx();
      drawBubble(ctx, p, '#38BDF8');
      expect(ctx.texts.length).toBe(1);
      expect(ctx.texts[0]).not.toContain('object Object');
    }
  });

  it('drawBubble bentuk sah tetap utuh (via clampText pipeline)', () => {
    const ctx = stubCtx();
    const out = drawBubble(ctx, 'Halo dunia', '#38BDF8', { clampText: (t) => safeText(t) });
    expect(out).toBe('Halo dunia');
    expect(ctx.texts[0]).toBe('Halo dunia');
  });
});
