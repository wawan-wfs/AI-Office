// @vitest-environment jsdom
// Guard painter bayangan platform (pedestal) — parts/pedestal_canvas.js.
// Konstanta glow diekspor satu sumber; nilai historis terkunci.
import { describe, it, expect } from 'vitest';
import { drawPlatformShadow, SHADOW_SIZE, SHADOW_CENTER, SHADOW_GLOW_0, SHADOW_GLOW_MID, SHADOW_GLOW_END } from '../scene/parts/pedestal_canvas.js';

function makeCtx(){
  const ops=[]; const grads=[];
  const mk=(kind,args)=>{ const g={kind,args,stops:[]};
    g.addColorStop=(o,c)=>g.stops.push([o,c]);
    grads.push(g); return g; };
  const ctx={
    _ops:ops, _grads:grads,
    createRadialGradient:(...a)=>{ const g=mk('radial',a); ops.push(['createRadialGradient',a,g]); return g; },
    fillRect:(...a)=>ops.push(['fillRect',a]),
    set fillStyle(v){ ops.push(['fillStyle',v]); },
  };
  return ctx;
}

describe('drawPlatformShadow', ()=>{
  it('mengekspor konstanta ukuran & pusat', ()=>{
    expect(SHADOW_SIZE).toBe(128);
    expect(SHADOW_CENTER).toBe(64);
  });

  it('guard nilai historis palet glow pedestal terkunci', ()=>{
    expect(SHADOW_GLOW_0).toBe('rgba(2,6,14,0.85)');
    expect(SHADOW_GLOW_MID).toBe('rgba(2,6,14,0.5)');
    expect(SHADOW_GLOW_END).toBe('rgba(2,6,14,0)');
  });

  it('gradien radial tepat (pusat 64,64 r8 → 62) + 3 stop dgn konstanta', ()=>{
    const c=makeCtx(); drawPlatformShadow(c);
    const g=c._grads[0];
    expect(g.kind).toBe('radial');
    expect(g.args).toEqual([64,64,8,64,64,62]);
    expect(g.stops).toEqual([
      [0,SHADOW_GLOW_0],
      [0.55,SHADOW_GLOW_MID],
      [1,SHADOW_GLOW_END],
    ]);
    const names=c._ops.map(o=>o[0]);
    expect(names).toEqual(['createRadialGradient','fillStyle','fillRect']);
    expect(c._ops.find(o=>o[0]==='fillRect')[1]).toEqual([0,0,128,128]);
  });
});
