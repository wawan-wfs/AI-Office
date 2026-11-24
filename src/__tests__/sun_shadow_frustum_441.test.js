import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SHADOW_EXTENT, applySunShadowConfig } from '../scene/parts/render_startup.js';

describe('siklus 441 — frustum bayangan matahari satu sumber', () => {
  it('SHADOW_EXTENT ≥ setengah diagonal proyeksi kampus (34×27)', () => {
    // setengah dimensi kampus 17 × 13,5; extent harus menutup keduanya + margin
    expect(SHADOW_EXTENT).toBeGreaterThanOrEqual(17);
    expect(SHADOW_EXTENT).toBeGreaterThanOrEqual(13.5);
    expect(SHADOW_EXTENT).toBe(28);
  });

  it('applySunShadowConfig mengisi 4 sisi ortho dgn ±SHADOW_EXTENT', () => {
    const cam = { left: 0, right: 0, top: 0, bottom: 0, updateProjectionMatrix: () => {} };
    const fake = { shadow: { camera: cam } };
    applySunShadowConfig(fake);
    expect(cam.left).toBe(-SHADOW_EXTENT);
    expect(cam.right).toBe(SHADOW_EXTENT);
    expect(cam.top).toBe(SHADOW_EXTENT);
    expect(cam.bottom).toBe(-SHADOW_EXTENT);
  });

  it('no-op aman pada input rusak/null', () => {
    expect(() => applySunShadowConfig(null)).not.toThrow();
    expect(() => applySunShadowConfig({})).not.toThrow();
    expect(applySunShadowConfig(null)).toBe(null);
  });

  it('OfficeScene tidak lagi hardcode literal frustum ±22; memakai helper', () => {
    const src = readFileSync(new URL('../scene/OfficeScene.js', import.meta.url), 'utf8');
    expect(src).not.toMatch(/shadow\.camera\.left\s*=\s*-22/);
    expect(src).toMatch(/applySunShadowConfig\(sun\)/);
  });
});
