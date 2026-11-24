import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as P from '../lib/ui_palette.js';

const root = resolve(__dirname, '..');
const osSrc = readFileSync(resolve(__dirname, '../scene/OfficeScene.js'), 'utf8');
const palSrc = readFileSync(resolve(__dirname, '../lib/ui_palette.js'), 'utf8');

describe('scene environment palette single-source (siklus 424)', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(P.SCENE_SKY).toBe(0x010A28);
    expect(P.SCENE_AMBIENT).toBe(0xFFF5EB);
    expect(P.SCENE_SUN).toBe(0xFFFAF0);
    expect(P.SCENE_SKYFILL).toBe(0x38BDF8);
    expect(P.SCENE_HEMI_SKY).toBe(0xF8FAFC);
    expect(P.SCENE_HEMI_GROUND).toBe(0x1E293B);
    expect(P.SCENE_GLASS).toBe(0xBBCCDD);
    expect(P.SCENE_CEIL_WHITE).toBe(0xffffff);
    expect(P.SCENE_WALL_DEEP).toBe(0x14243D);
  });
  it('OfficeScene delegasi scene env ke konstanta palet', () => {
    expect(osSrc).toContain('new THREE.Color(SCENE_SKY)');
    expect(osSrc).toContain('new THREE.FogExp2(SCENE_SKY,0.0048)');
    expect(osSrc).toContain('new THREE.AmbientLight(SCENE_AMBIENT,0.65)');
    expect(osSrc).toContain('new THREE.DirectionalLight(SCENE_SUN,1.45)');
    expect(osSrc).toContain('new THREE.DirectionalLight(SCENE_SKYFILL,0.45)');
    expect(osSrc).toContain('new THREE.HemisphereLight(SCENE_HEMI_SKY,SCENE_HEMI_GROUND,0.55)');
    expect(osSrc).toContain('color:SCENE_GLASS');
    expect(osSrc).toContain('M(SCENE_WALL_DEEP)');
    expect(osSrc).toContain('SCENE_CEIL_WHITE');
  });
  it('0 literal env tersisa di lokasi asal', () => {
    for (const lit of ['0x010A28','0xFFF5EB','0xFFFAF0','0xBBCCDD','0x14243D'])
      expect(osSrc.includes(lit)).toBe(false);
  });
  it('anti-poisoning: SCENE_SKYFILL terpisah dari konstanta lain', () => {
    expect(P.SCENE_SKYFILL).not.toBe(P.SCENE_SKY);
    expect(P.SCENE_HEMI_GROUND).not.toBe(P.SCENE_WALL_DEEP || P.SCENE_HEMI_SKY);
  });
});
