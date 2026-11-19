import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const html = readFileSync('public/landing.html', 'utf8');

describe('siklus 638: progress bar landing a11y (role progressbar + aria)', () => {
  it('fill punya role=progressbar dgn aria-labelledby label', () => {
    expect(html).toMatch(/id="tprog-fill"[^>]*role="progressbar"/);
    expect(html).toMatch(/id="tprog-fill"[^>]*aria-labelledby="tprog-label"/);
  });

  it('atribut aria diisi live saat fetch sukses (valuemax/valuenow/valuetext)', () => {
    expect(html).toContain("fill.setAttribute('aria-valuemax',String(d.tasks_total))");
    expect(html).toContain("fill.setAttribute('aria-valuenow',String(done))");
    expect(html).toContain("fill.setAttribute('aria-valuetext',");
  });

  it('default HTML masih valuemax=0 & valuenow=0 (hidden state), fetch tetap wfs-api', () => {
    expect(html).toMatch(/aria-valuemax="0"/);
    expect(html).toMatch(/aria-valuenow="0"/);
    expect(html).toContain("fetch('/wfs-api/dashboard/stats')");
    expect(html).not.toContain("fetch('/api/dashboard/stats')");
  });
});
