// Siklus 528: footer layar lobi menampilkan hitungan agen ON-SITE — dulu selalu
// agentData.length (26) meski agen lunch/nightfall berstatus 'offsite' (tidak
// di kantor, walker & sittingChar hidden). lobbyAgentsText(n, total) →
// 'N/TOTAL DI KANTOR'; lobbyOnsiteCount(agentData) menghitung state ≠ 'offsite'.
import { describe, it, expect } from 'vitest';
import { lobbyAgentsText, lobbyOnsiteCount } from '../scene/parts/lobby_screen.js';

describe('lobbyAgentsText dgn total (siklus 528)', () => {
  it('total valid → format N/TOTAL DI KANTOR', () => {
    expect(lobbyAgentsText(26, 26)).toBe('26/26 DI KANTOR');
    expect(lobbyAgentsText(21, 26)).toBe('21/26 DI KANTOR');
    expect(lobbyAgentsText(1, 26)).toBe('1/26 DI KANTOR');
  });
  it('0 dari total valid → 0/26 DI KANTOR (malam semua offsite = informasi)', () => {
    expect(lobbyAgentsText(0, 26)).toBe('0/26 DI KANTOR');
  });
  it('total tak valid/0/negatif → perilaku lama utuh (kompatibilitas)', () => {
    expect(lobbyAgentsText(26)).toBe('26 AGEN BERTUGAS');
    expect(lobbyAgentsText(26, 0)).toBe('26 AGEN BERTUGAS');
    expect(lobbyAgentsText(26, NaN)).toBe('26 AGEN BERTUGAS');
    expect(lobbyAgentsText(26, undefined)).toBe('26 AGEN BERTUGAS');
    expect(lobbyAgentsText(12, -3)).toBe('12 AGEN BERTUGAS');
  });
  it('n > total (korup) → fallback teks lama, bukan angka mustahil', () => {
    expect(lobbyAgentsText(30, 26)).toBe('30 AGEN BERTUGAS');
  });
  it('guard lama tetap: non-finite/negatif tanpa total → AGEN SIAP', () => {
    expect(lobbyAgentsText(NaN)).toBe('AGEN SIAP');
    expect(lobbyAgentsText(-1)).toBe('AGEN SIAP');
  });
  it('total pecah dibulatkan (floor) & float n', () => {
    expect(lobbyAgentsText(25.9, 26.4)).toBe('25/26 DI KANTOR');
  });
});

describe('lobbyOnsiteCount (siklus 528)', () => {
  const ag = (state) => ({ state });
  it('semua sitting → semua dihitung', () => {
    expect(lobbyOnsiteCount([ag('sitting'), ag('sitting'), ag('sitting')])).toBe(3);
  });
  it('offsite dikecualikan (lunch/nightfall/leaving selesai)', () => {
    expect(lobbyOnsiteCount([ag('sitting'), ag('offsite'), ag('offsite')])).toBe(1);
    expect(lobbyOnsiteCount([ag('offsite'), ag('offsite')])).toBe(0);
  });
  it('state berjalan/rapat tetap dihitung (masih di kantor)', () => {
    expect(lobbyOnsiteCount([ag('walking_out'), ag('walking_back'), ag('meeting'), ag('leaving')])).toBe(4);
  });
  it('entri korup (null/bukan objek) dilewati tanpa error', () => {
    expect(lobbyOnsiteCount([null, ag('sitting'), 'x', 42, {}])).toBe(2); // {} tanpa state ≠ 'offsite' → dihitung
  });
  it('guard: non-array / kosong → null / 0', () => {
    expect(lobbyOnsiteCount(null)).toBe(null);
    expect(lobbyOnsiteCount(undefined)).toBe(null);
    expect(lobbyOnsiteCount('nope')).toBe(null);
    expect(lobbyOnsiteCount([])).toBe(0);
  });
});
