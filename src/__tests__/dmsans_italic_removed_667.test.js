import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { join } from 'node:path';

const css = readFileSync('public/fonts/fonts.css', 'utf8');
const faces = css.match(/@font-face\{[^}]*\}|@font-face\s*\{[^}]*\}/g) ?? [];

it('fonts.css kini 9 blok @font-face (666: 11 - 2 face DM Sans 300 italic basi siklus 667)', () => {
  expect(faces.length).toBe(9);
});

it('tidak ada face DM Sans italic tersisa di fonts.css', () => {
  expect(css.includes('font-style: italic')).toBe(false);
  expect(css.match(/XDV30TGc/g).length).toBe(1); // hanya di komentar dokumentasi
  expect(css.match(/XDV36TGc5pg/g).length).toBe(1);
});

it('file woff2 italic Light hilang dari public/fonts, face aktif tetap ada', () => {
  expect(existsSync('public/fonts/rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat_XDV30TGc.woff2')).toBe(false);
  expect(existsSync('public/fonts/rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat_XDV36TGc5pg.woff2')).toBe(false);
  expect(existsSync('public/fonts/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2')).toBe(true);
  expect(existsSync('public/fonts/dmmono-500-latin.woff2')).toBe(true);
});

it('dist ter-build paritas: 9 blok fonts.css, 0 italic Light di dist/fonts', () => {
  const dist = readFileSync(join('dist', 'fonts', 'fonts.css'), 'utf8');
  expect((dist.match(/@font-face/g) ?? []).length).toBe(9);
  expect(dist.includes('font-style: italic')).toBe(false);
  expect(existsSync(join('dist', 'fonts', 'rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat_XDV30TGc.woff2'))).toBe(false);
});
