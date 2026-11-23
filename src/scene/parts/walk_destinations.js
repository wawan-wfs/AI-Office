// Tujuan jalan-jalan agent (pilih saat walking_out tanpa kolaborasi):
// pantry, dispenser, printer, lounge, ruang meeting, resepsionis, jalur tengah, tanaman.
// Diekstrak murni agar bisa di-unit-test; dipakai motion.js via createMotion ctx.
export const WALK_DESTINATIONS = [
  { x: -9.4, z: 3.6 },   // pantry
  { x: -9.15, z: 0.75 }, // dispenser air (0.9 terlalu dekat kursi GILANG d=1.0 <1.2)
  { x: 2.2, z: -7.0 },   // printer
  { x: 9.0, z: 3.9 },    // lounge (9.4,4.8 lama = DI DALAM footprint sofa; digeser ke tepi bebas)
  { x: 6.0, z: -0.6 },   // pintu ruang meeting
  { x: 6.8, z: 4.9 },    // depan resepsionis
  { x: -0.5, z: 4.2 },   // jalur tengah
  { x: -3.2, z: -6.2 },  // dekat tanaman belakang
];

// Perluasan destinasi multi-lantai kampus WFS PROJECT (L1 Atrium, L2 Mezzanine, L3 Penthouse)
export const CAMPUS_WALK_DESTINATIONS = [
  ...WALK_DESTINATIONS,
  { x: 2.2, z: -5.8, label: 'Datacenter Glass Wall (L1)' },
  { x: 11.85, z: -5.2, label: 'East Innovation Terrace (L1)' },  // 11.5 d=1.0 ke meja RIAN
  { x: -11.85, z: -5.2, label: 'West Architecture Hub (L1)' },   // d=1.0 ke CLARA
  { x: 11.85, z: 1.2, label: 'Mezzanine East Balcony (L2)' },    // d=1.0 ke HENDRA
  { x: -11.85, z: 1.2, label: 'Mezzanine West Pod (L2)' },       // d=1.0 ke GILANG
  { x: -6.0, z: 5.6, label: 'Executive Cafe Promenade (L3)' },
  { x: 6.5, z: 5.6, label: 'Penthouse Strategy Terrace (L3)' },
  { x: 0.0, z: 8.5, label: 'Founder Suite View Deck (L3)' },
  { x: 8.0, z: -9.0, label: 'L1 South Window Walk' },
  { x: -8.0, z: -9.0, label: 'L1 South-West Window' },
  { x: 14.0, z: -1.6, label: 'L1 East Corridor' },  // -2 d=1.12 ke meja (13.5,-3)
  { x: -14.0, z: -2.0, label: 'L1 West Corridor' },
  { x: 0.0, z: 3.0, label: 'L2 Central Walk' },  // 2.6 d=1.10 ke meja (0,1.5)
  { x: 13.2, z: 3.4, label: 'L2 East Gallery' },
  { x: -13.2, z: 3.4, label: 'L2 West Gallery' },
  { x: 12.0, z: 10.5, label: 'L3 East Atrium Walk' },
  { x: -12.0, z: 10.5, label: 'L3 West Atrium Walk' },
];

// Semua titik tujuan harus berada di luar rintangan & dalam batas ruangan
// (kampus 34 x 27 → ±17 / ±13.5; efektif ±16.5 / ±13). Dipakai test & bisa dipakai ulang
// saat menambah tujuan baru supaya agen tidak pernah ditugaskan ke spot valid.
export function isSafeDestination(d, inObstacleFn, bounds = { x: 16.5, z: 13.0 }) {
  return (
    Number.isFinite(d.x) && Number.isFinite(d.z) &&
    Math.abs(d.x) <= bounds.x && Math.abs(d.z) <= bounds.z &&
    !inObstacleFn(d.x, d.z)
  );
}
