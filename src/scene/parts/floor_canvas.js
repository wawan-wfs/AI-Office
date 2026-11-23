// Painter kanvas lantai & AO dinding — murni (ctx di-inject, tanpa THREE/DOM).
// Diekstrak dari OfficeScene; urutan & parameter perintah gambar identik
// kode inline lama (tampilan tak berubah).

// Palet satu sumber (siklus 415) — painter & guard test memakai konstanta ini.
export const FLOOR_WOOD_BASE = '#8A7C68';       // latar parket
export const BOARD_NAT = 'rgba(90,70,50,0.25)'; // nat papan kayu
export const AO_STRIP = ['rgba(0,0,0,0.52)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0)']; // AO pangkal dinding
export const TERRAZZO_WHITE = '#FFFFFF';        // nilai tint default drawTerrazzo
export const TERRAZZO_BG = '#E6E0D2';           // latar terazzo
export const TERRAZZO_CHIPS = ['#C4B79B', '#C39A96', '#93ADA2', '#A79A85', '#8E9BB0', '#D9CDB4'];
export const TERRAZZO_TONES = ['rgba(216,207,188,0.09)', 'rgba(201,194,178,0.07)', 'rgba(190,182,166,0.06)']; // kilap lempeng
export const MARBLE_VEIN = 'rgba(105,95,78,0.30)'; // vena marmer
export const TERRAZZO_GRID = 'rgba(80,75,65,0.16)'; // nat grid

// lantai parket kayu prosedural 512×512: 10 baris papan dengan lebar & shade
// deterministik (hash dari r dan x) + garis nat + top coat gradien
export function drawWoodFloor(x) {
  x.fillStyle = FLOOR_WOOD_BASE; x.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 10; r++) {
    const y = r * 52; let x0 = (r % 2) * -60;
    while (x0 < 512) {
      const w = 120 + ((r * 97 + x0) % 90);
      const shade = 112 + ((r * 53 + x0 * 7) % 30);
      x.fillStyle = `rgb(${shade},${shade - 18},${shade - 45})`;
      x.fillRect(x0 + 2, y + 2, w - 3, 48);
      x.fillStyle = BOARD_NAT;
      x.fillRect(x0 + 2, y + 2, w - 3, 2);
      x0 += w;
    }
  }
}

// strip AO kontak pangkal dinding 16×64: gradien gelap → transparan
export function drawAoStrip(x) {
  const g = x.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, AO_STRIP[0]); g.addColorStop(.45, AO_STRIP[1]); g.addColorStop(1, AO_STRIP[2]);
  x.fillStyle = g; x.fillRect(0, 0, 16, 64);
}

// terazzo 512x512: latar netral + chip organik deterministik + vena marmer halus + nat grid tipis
export function drawTerrazzo(x, tint = TERRAZZO_WHITE) {
  x.fillStyle = tint === TERRAZZO_WHITE ? TERRAZZO_BG : tint;
  x.fillRect(0, 0, 512, 512);
  const chips = TERRAZZO_CHIPS;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 420; i++) {
    x.fillStyle = chips[i % chips.length];
    x.globalAlpha = 0.7 + rnd() * 0.3;
    const cx = rnd() * 512, cy = rnd() * 512, r = 6 + rnd() * 15;
    x.beginPath(); x.ellipse(cx, cy, r, r * (0.6 + rnd() * 0.6), rnd() * 3.14, 0, 6.29); x.fill();
  }
  x.globalAlpha = 1;
  // lapisan kilap lempeng marmer: patch tone besar lembut (berkedalaman dari jarak kamera)
  const tones = TERRAZZO_TONES;
  for (let t = 0; t < 10; t++) {
    x.fillStyle = tones[t % tones.length];
    x.globalAlpha = 1;
    const cx = rnd() * 512, cy = rnd() * 512, rr = 70 + rnd() * 110;
    x.beginPath(); x.ellipse(cx, cy, rr, rr * (0.55 + rnd() * 0.5), rnd() * 3.14, 0, 6.29); x.fill();
  }
  x.strokeStyle = MARBLE_VEIN; x.lineWidth = 2.2;
  for (let v = 0; v < 5; v++) {
    x.beginPath(); let vx = rnd() * 512, vy = 0; x.moveTo(vx, vy);
    while (vy < 512) { vy += 30 + rnd() * 40; vx += (rnd() - 0.5) * 60; x.lineTo(vx, vy); }
    x.stroke();
  }
  x.strokeStyle = TERRAZZO_GRID; x.lineWidth = 1.5;
  for (let g = 0; g <= 512; g += 128) {
    x.beginPath(); x.moveTo(g, 0); x.lineTo(g, 512); x.stroke();
    x.beginPath(); x.moveTo(0, g); x.lineTo(512, g); x.stroke();
  }
}
