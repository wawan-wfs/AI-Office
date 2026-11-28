// Siklus 537 — guard kontrak warna identitas canvas (agentHexSafe satu sumber).
// Dulu konsumen canvas scene (nameplate meja, label float, bubble chat, layar
// monitor) memakai agent.hex MENTAH: agen tanpa hex/undefined → strokeStyle
// undefined (garis aksen & border glow tak tergambar) tanpa fallback.
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { agentHexSafe, RC_FOUNDER_FALLBACK_HEX } from '../lib/ui_palette.js';
import { drawNameplate } from '../scene/parts/nameplate_spec.js';
import { drawLabelText, LABEL_FULL } from '../scene/parts/label_spec.js';
import { drawBubble } from '../scene/parts/bubble_canvas.js';

const mkCtx = () => {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 64;
  return cv.getContext('2d');
};

describe('agentHexSafe (siklus 537)', () => {
  it('kontrak: hex sah #RRGGBB dipertahankan; lainnya → fallback', () => {
    expect(agentHexSafe({ hex: '#F59E0B' })).toBe('#F59E0B');
    expect(agentHexSafe({ hex: undefined })).toBe(RC_FOUNDER_FALLBACK_HEX);
    expect(agentHexSafe({ hex: null })).toBe(RC_FOUNDER_FALLBACK_HEX);
    expect(agentHexSafe(null)).toBe(RC_FOUNDER_FALLBACK_HEX);
    expect(agentHexSafe({})).toBe(RC_FOUNDER_FALLBACK_HEX);
    expect(agentHexSafe({ hex: 'red' })).toBe(RC_FOUNDER_FALLBACK_HEX);
    expect(agentHexSafe({ hex: '#38b' })).toBe(RC_FOUNDER_FALLBACK_HEX); // shorthand ditolak
    expect(RC_FOUNDER_FALLBACK_HEX).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('canvas consumers: hex undefined → fallback terpakai, bukan undefined', () => {
    const a = { name: 'tes agen', role: 'role tes', hex: undefined };
    // drawNameplate: rekam urutan fillStyle — aksen bar harus fallback (setelah BG, sebelum teks)
    const seq = [];
    const mkStub = () => ({ canvas: { width: 0, height: 0 }, get fillStyle() { return this._f; },
      set fillStyle(v) { seq.push(v); this._f = v; }, strokeStyle: null, shadowColor: null,
      lineWidth: 0, font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
      fillRect() {}, beginPath() {}, roundRect() {}, rect() {}, fill() {}, stroke() {}, moveTo() {},
      lineTo() {}, closePath() {}, arc() {}, quadraticCurveTo() {}, fillText() {}, measureText: () => ({ width: 10 }),
      save() {}, restore() {}, getImageData: () => ({ data: [255, 255, 255, 255] }) });
    const c1 = mkStub();
    drawNameplate(c1, a.name, a.role, a.hex);
    expect(seq).toContain(RC_FOUNDER_FALLBACK_HEX); // fallback bar, bukan undefined
    expect(seq).not.toContain(undefined);
    expect(seq).not.toContain('undefined');
    // drawLabelText: strip kiri label float = fallback
    seq.length = 0;
    const c2 = mkStub();
    drawLabelText(c2, a, LABEL_FULL, true);
    expect(seq).toContain(RC_FOUNDER_FALLBACK_HEX);
    // drawBubble: stroke border = fallback
    const c3 = mkStub();
    const t = drawBubble(c3, 'halo', undefined);
    expect(t).toBe('halo');
    expect(c3.strokeStyle).toBe(RC_FOUNDER_FALLBACK_HEX);
    // dan hex sah tetap lolos tanpa disentuh
    const c4 = mkStub();
    drawBubble(c4, 'x', '#FF8800');
    expect(c4.strokeStyle).toBe('#FF8800');
  });

  it('sweep: tidak ada lagi konsumen canvas scene yang memakai agent.hex mentah', () => {
    const files = [
      'src/scene/OfficeScene.js',
      'src/scene/parts/nameplate_spec.js',
      'src/scene/parts/label_spec.js',
      'src/scene/parts/bubble_canvas.js',
      'src/scene/parts/motion.js', // siklus 538: bubble converse & lunch ikut satu sumber
    ];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      // pola mentah berbahaya: fillStyle/strokeStyle/shadowColor langsung agent.hex / .agent.hex tanpa helper
      expect(src, f).not.toMatch(/(fillStyle|strokeStyle|shadowColor)\s*=\s*(\w+\.)?agent\.hex\b/);
      expect(src, f).not.toMatch(/=\s*hexArg\b/); // tidak ada pemakaian argumen mentah
    }
    // OfficeScene memakai helper satu sumber utk screenData & makeLabel
    const os = readFileSync('src/scene/OfficeScene.js', 'utf8');
    expect(os).toMatch(/agentHexSafe\(agent\)/);
  });
});
