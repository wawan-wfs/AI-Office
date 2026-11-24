// Guard siklus 444: palet whiteboard satu sumber (WS_*).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  WS_TRAY, WS_MARKER_BLACK, WS_MARKER_BLUE, WS_MARKER_RED, WS_MARKER_GREEN, WS_ERASER,
} from '../src/lib/ui_palette.js';
import { WB_TRAY, markerItems } from '../src/scene/parts/whiteboard_spec.js';

const SPEC = readFileSync(resolve(process.cwd(), 'src/scene/parts/whiteboard_spec.js'), 'utf8');

describe('palet whiteboard (WS_*)', () => {
  it('nilai historis terkunci', () => {
    expect(WS_TRAY).toBe(0x8a9ca6);
    expect(WS_MARKER_BLACK).toBe(0x1e293b);
    expect(WS_MARKER_BLUE).toBe(0x2563eb);
    expect(WS_MARKER_RED).toBe(0xef4444);
    expect(WS_MARKER_GREEN).toBe(0x16a34a);
    expect(WS_ERASER).toBe(0x475569);
  });

  it('anti-poisoning: nilai tetap dari primitif sumber', () => {
    expect(WB_TRAY.color).toBe(WS_TRAY);
    const items = markerItems();
    expect(items.find(i => i.id === 'marker-black').color).toBe(WS_MARKER_BLACK);
    expect(items.find(i => i.id === 'eraser').color).toBe(WS_ERASER);
  });

  it('pemakaian di titik asal (bukan literal inline)', () => {
    expect(SPEC).toMatch(/color:\s*WS_TRAY/);
    expect(SPEC).toMatch(/color:\s*WS_MARKER_BLACK/);
    expect(SPEC).toMatch(/color:\s*WS_ERASER/);
  });

  it('0 literal hex di whiteboard_spec.js', () => {
    const literals = SPEC.match(/0x[0-9a-fA-F]{6}/g) || [];
    expect(literals).toEqual([]);
  });
});
