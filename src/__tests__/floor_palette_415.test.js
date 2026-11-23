import { describe, it, expect } from 'vitest';
import {
  FLOOR_WOOD_BASE, BOARD_NAT, AO_STRIP, TERRAZZO_WHITE, TERRAZZO_BG,
  TERRAZZO_CHIPS, TERRAZZO_TONES, MARBLE_VEIN, TERRAZZO_GRID,
  drawWoodFloor, drawAoStrip, drawTerrazzo,
} from '../scene/parts/floor_canvas.js';

// Siklus 415 — guard palet lantai satu sumber: nilai historis terkunci,
// tanpa literal warna tersisa di painter, delegasi penuh ke konstanta.

describe('floor_canvas palet satu sumber (415)', () => {
  it('nilai historis terkunci', () => {
    expect(FLOOR_WOOD_BASE).toBe('#8A7C68');
    expect(BOARD_NAT).toBe('rgba(90,70,50,0.25)');
    expect(AO_STRIP).toEqual(['rgba(0,0,0,0.52)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0)']);
    expect(TERRAZZO_WHITE).toBe('#FFFFFF');
    expect(TERRAZZO_BG).toBe('#E6E0D2');
    expect(TERRAZZO_CHIPS).toEqual(['#C4B79B', '#C39A96', '#93ADA2', '#A79A85', '#8E9BB0', '#D9CDB4']);
    expect(TERRAZZO_TONES).toEqual(['rgba(216,207,188,0.09)', 'rgba(201,194,178,0.07)', 'rgba(190,182,166,0.06)']);
    expect(MARBLE_VEIN).toBe('rgba(105,95,78,0.30)');
    expect(TERRAZZO_GRID).toBe('rgba(80,75,65,0.16)');
  });

  it('drawTerrazzo default: latar = TERRAZZO_BG, chip & tone dari konstanta', () => {
    const ops = [];
    const h = { fillStyle: '', globalAlpha: 1, lineWidth: 0, strokeStyle: '' };
    ['fillStyle', 'strokeStyle'].forEach(p => Object.defineProperty(h, p, {
      get() { return h['_' + p]; },
      set(v) { h['_' + p] = v; ops.push([p, v]); },
    }));
    h.createLinearGradient = () => ({ addColorStop: () => {} });
    h.fillRect = () => ops.push(['fillRect']);
    h.beginPath = () => {}; h.ellipse = () => {}; h.fill = () => {};
    h.stroke = () => {}; h.moveTo = () => {}; h.lineTo = () => {};
    drawTerrazzo(h);
    const bgFill = ops.find(o => o[0] === 'fillStyle' && o[1] === TERRAZZO_BG);
    expect(bgFill).toBeTruthy();
    const chipFills = ops.filter(o => o[0] === 'fillStyle' && TERRAZZO_CHIPS.includes(o[1]));
    expect(chipFills.length).toBeGreaterThan(0);
    const toneFills = ops.filter(o => o[0] === 'fillStyle' && TERRAZZO_TONES.includes(o[1]));
    expect(toneFills.length).toBeGreaterThan(0);
  });

  it('drawAoStrip: 3 stop gradien persis konstanta AO_STRIP', () => {
    const stops = [];
    const h = {
      createLinearGradient: () => ({ addColorStop: (o, c) => stops.push([o, c]) }),
      fillRect: () => {}, fillStyle: '',
    };
    drawAoStrip(h);
    expect(stops.map(s => s[1])).toEqual(AO_STRIP);
  });

  it('tanpa literal warna tersisa di floor_canvas.js & lobby_screen.js', async () => {
    const { readFileSync } = await import('node:fs');
    for (const f of ['../scene/parts/floor_canvas.js', '../scene/parts/lobby_screen.js']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf8');
      const literals = src.match(/(?:rgba\(|'#)(?!.*export const)[0-9A-Fa-f][^"']*/g) || [];
      // hanya boleh ada literal di baris deklarasi konstanta export
      const bad = src.split('\n').filter(line =>
        /['"](?:rgba\(|#)[0-9A-Fa-f]/.test(line) && !/export const/.test(line) &&
        !line.includes('ui_palette'));
      expect(bad, f).toEqual([]);
      void literals;
    }
  });
});
