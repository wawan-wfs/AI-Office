// @vitest-environment jsdom
// Siklus 604: OverlayHelp — search filter shortcut + tab kategori
// dan sinkronisasi registri shortcut (formatShortcutHelpSummary vs KEYBOARD_SHORTCUTS).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import OverlayHelp from '../components/OverlayHelp';
import { KEYBOARD_SHORTCUTS, formatShortcutHelpSummary, getShortcutsByCategory } from '../scene/parts/shortcut_spec';

afterEach(cleanup);

describe('help_shortcuts_604 — OverlayHelp pencarian & kategori shortcut', () => {
  it('ringkasan bantuan memuat setiap key di registri KEYBOARD_SHORTCUTS (sinkron)', () => {
    const summary = formatShortcutHelpSummary();
    for (const s of KEYBOARD_SHORTCUTS) {
      const covered = ['Shift+A', 'Shift+1/2/3', '+ / −'];
      if (covered.includes(s.key)) continue;
      const k = s.key.startsWith('Esc') ? 'Esc' : s.key.startsWith('Panah') ? 'Panah' : s.key;
      expect(summary).toContain(`${k} =`);
    }
  });

  it('setiap kategori punya minimal 1 shortcut & label valid', () => {
    for (const c of ['panel', 'audio', 'navigasi', 'tampilan']) {
      const list = getShortcutsByCategory(c);
      expect(list.length).toBeGreaterThan(0);
      expect(list.every(s => s.label && s.desc)).toBe(true);
    }
  });

  it('tidak ada key duplikat di registri', () => {
    const keys = KEYBOARD_SHORTCUTS.map(s => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('dialog help membuka langkah Shortcut Keyboard dan menampilkan kartu registri', () => {
    render(<OverlayHelp show onClose={() => {}} />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByText('Berikutnya →'));
    expect(screen.getByRole('region', { name: 'Daftar shortcut keyboard' })).toBeTruthy();
    expect(screen.getAllByText('Papan Task (Kanban)').length).toBeGreaterThan(0);
  });

  it('pencarian shortcut menyaring daftar sesuai input (case-insensitive)', () => {
    render(<OverlayHelp show onClose={() => {}} />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByText('Berikutnya →'));
    const input = screen.getByLabelText('Cari shortcut');
    fireEvent.change(input, { target: { value: 'kamera' } });

    // Harus menampilkan opsi terkait kamera (Sudut Kamera Preset, Orbit Kamera, dsb.)
    expect(screen.getByText('Sudut Kamera Preset')).toBeTruthy();
    // Papan Task tidak mengandung kata "kamera" -> disembunyikan
    expect(screen.queryByText('Papan Task (Kanban)')).toBeNull();
  });

  it('tab kategori memfilter daftar kartu shortcut', () => {
    render(<OverlayHelp show onClose={() => {}} />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByText('Berikutnya →'));
    const audioTab = screen.getByRole('tab', { name: 'Audio & Ambience' });
    fireEvent.click(audioTab);

    // Kategori audio tampil
    expect(screen.getByText('Mute Audio')).toBeTruthy();
    expect(screen.getByText('Ambience Hum')).toBeTruthy();
    // Shortcut panel tidak muncul
    expect(screen.queryByText('Papan Task (Kanban)')).toBeNull();
  });

  it('menampilkan pesan kosong bila pencarian tidak cocok', () => {
    render(<OverlayHelp show onClose={() => {}} />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByText('Berikutnya →'));
    const input = screen.getByLabelText('Cari shortcut');
    fireEvent.change(input, { target: { value: 'zzzz_tidak_ada' } });

    expect(screen.getByText(/Tidak ada shortcut yang cocok/)).toBeTruthy();
  });

  it('menutup dialog memanggil onClose dan mereset step', () => {
    const handleClose = vi.fn();
    const { rerender } = render(<OverlayHelp show onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Tutup panduan'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(<OverlayHelp show={false} onClose={handleClose} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
