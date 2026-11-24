/**
 * Siklus 393 — satu sumber warna aksen biru kantor (UI React + scene status).
 *
 * `#4D9FFF` (dan turunan rgba-nya) sebelumnya tersalin literal di 6 tempat
 * dengan potensi drift: fallback avatar AgentInspector (2×), kartu statistik
 * Dashboard (2×), status 'walk' di scene (agent_status.js), tombol audio
 * SettingsModal, dan highlight omniroute online di ProjectPanel. Ini bukan
 * warna status task — itu TASK_STATUS_COLORS — tapi aksen identitas kantor
 * (kartu agen berjalan, kartu jumlah Proyek/Agen, hover baris dashboard).
 *
 * Satu tabel kini memutuskan; pemakaian rgba memakai helper accentAlpha()
 * agar nilai 77,159,255 tak pernah diketik ulang (anti-drift).
 */

/** Aksen biru identitas kantor WFS (dipakai juga scene agent_status.walk). */
export const ACCENT_BLUE = '#4D9FFF';

/** rgb triplet ACCENT_BLUE, untuk interpolasi manual bila perlu. */
export const ACCENT_BLUE_RGB = '77,159,255';

/** rgb triplet failed #EF4444 (TASK_STATUS_COLORS.failed), untuk rgba. */
export const FAILED_RGB = '239,68,68';

/** rgba(alpha 0..1) di atas warna failed — komposisi satu sumber. */
export function failedAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${FAILED_RGB},${v})`;
}

/** rgba(alpha 0..1) di atas ACCENT_BLUE — satu titik kebenaran komposisi. */
export function accentAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${ACCENT_BLUE_RGB},${v})`;
}

/**
 * Siklus 396 — warna teks sekunder/muted UI (satu sumber).
 *
 * `#8fa2c4` sebelumnya diketik literal 20× di ShConsole (placeholder kosong,
 * meta task/agent, hint branch, status muat). Bukan warna status task —
 * teks redup netral kebiruan. Satu titik kebenaran di sini.
 */
export const MUTED_TEXT = '#8fa2c4';

/** Ikon/tombol sky terang (tombol uji audio) — sebelumnya literal #38bdf8. */
export const SKY_BUTTON = '#38bdf8';

/**
 * Siklus 398 — warna kartu statistik Dashboard tersisa (satu sumber).
 *
 * `#8B5CF6` (violet, kartu "Task") sebelumnya literal di Dashboard dan
 * duplikat hex identik di agents_spec (TRAINER AI — identitas karakter,
 * tetap di spec agen). `#ADDBF2` (biru muda, kartu "File dihasilkan")
 * juga literal. Keduanya bukan warna status task — aksen kartu.
 */
export const VIOLET_CARD = '#8B5CF6';
export const PALE_BLUE_CARD = '#ADDBF2';

/**
 * Siklus 399 — amber aksen kanvas scene (satu sumber).
 *
 * `#F59E0B` sebelumnya literal di 3 painter kanvas: TV lounge (header
 * 'WFS HQ · LIVE' + badge SINKRON/stale), border label zona, dan judul
 * whiteboard sprint. Bukan warna status task (running kanonik) — aksen
 * brand amber identitas kantor di kanvas.
 */
export const AMBER_ACCENT = '#F59E0B';

/**
 * Siklus 315 — warna teks muted kanvas scene (satu sumber).
 *
 * `#8fa3bd` sebelumnya literal inline di 6 painter kanvas scene (effects.js 2×,
 * whiteboard_canvas.js 2×, projectboard.js 2×, projectboard_data.js 2×) dan
 * diketik ulang di konstanta TV_MUTED/LS_MUTED. Berbeda dgn MUTED_TEXT UI
 * (#8fa2c4) — nilai kanvas scene sengaja dipertahankan identik (tampilan tak
 * berubah); satu titik kebenaran di sini.
 */
export const SCENE_MUTED_RGB = '143,163,189';
export const SCENE_MUTED = `#${SCENE_MUTED_RGB.split(',').map(n => (+n).toString(16).padStart(2, '0')).join('')}`;

/**
 * Siklus 400 — cyan neon & violet statistik (satu sumber).
 *
 * `#00F0FF` (cyan neon) sebelumnya literal di FloorNavigator (warna L2),
 * ikon moon QuickToolbar, plakat LEVEL 02 terraces, dan LED neon. Bukan
 * warna status task — aksen neon identitas lantai 2. `#A78BFA` (violet)
 * sebelumnya literal di Ticker (baris Host RAM) — aksen teks statistik.
 * Identitas karakter agen (extended_desks/agents_spec) tetap di spec.
 */
export const CYAN_NEON = '#00F0FF';

/**
 * Siklus 401 — hijau aksen kanvas scene (satu sumber).
 *
 * `#10E5A0` sebelumnya literal di plakat LEVEL 03 terraces. Sama hex dengan
 * status kananik task done (TASK_STATUS_COLORS.done / agent_status.work) —
 * delegasi aksen plakat tetap via ui_palette agar evolusi terpisah bisa
 * dilakukan (pola sama dengan AMBER_ACCENT siklus 399).
 */
export const GREEN_ACCENT = '#10E5A0';
export const VIOLET_STATS = '#A78BFA';

/**
 * Cyan default divisi/preset TaskBoard (#38BDF8, sky blue) — siklus 402.
 * Fallback warna divisi aktif & warna awal form pembuat preset/divisi.
 */
export const SKY_DIVISION = '#38BDF8';

/** Pink poster lounge CODE COFFEE (#F472B6) — poster slogan & dekor (418). */
export const PINK_ACCENT = '#F472B6';

/** Hijau emerald poster lounge SHIP VALUE (#34D399) — poster slogan (418). */
export const EMERALD_ACCENT = '#34D399';

/**
 * Siklus 403 — palet teks ShConsole (satu sumber).
 *
 * `#eaf1ff` (teks terang, nilai/nama/input) sebelumnya literal 6× di
 * ShConsole.jsx. Bukan warna status task — teks utama panel konsol.
 */
export const BRIGHT_TEXT = '#eaf1ff';

/** Latar footer status papan (#0b1424, siklus 416). */
export const PB_FOOT = '#0b1424';
/** Latar panel kolom papan (#17233a, siklus 416). */
export const PB_COL_BG = '#17233a';
/** Latar kartu papan (#0d1524, siklus 416). */
export const PB_CARD = '#0d1524';
/** Bingkai papan proyek (#2c3e5c, siklus 416) — stroke kanvas & mesh frame. */
export const PB_FRAME = '#2c3e5c';
/** Label ANTRI papan (#9aa7b8) = TASK_STATUS_COLORS.pending — siklus 416. */
export const PB_PENDING = '#9aa7b8';
/** Latar utama papan proyek (#10192b, siklus 416). */
export const PB_BG = '#10192b';

/** Abu-abu redup untuk meta kecil (timestamp, sumber log, badge stream). */
export const FAINT_META = '#5f6f90';

/** Teks sekunder ShConsole (#9fb0d0, siklus 406) — tab non-aktif, logLine. */
export const SUB_TEXT = '#9fb0d0';

/** Latar tab/refresh ShConsole (#18233c, siklus 406). */
export const TAB_BG = '#18233c';

/** Latar tombol aktif/pre ShConsole (#23324f, siklus 406). */
export const BTN_BG = '#23324f';

/** Latar input/select ShConsole (#0d1526, siklus 406). */
export const INPUT_BG = '#0d1526';

/** Teks isi drawer ShConsole (#d7e0f0, siklus 407). */
export const DRAWER_TEXT = '#d7e0f0';

/** Latar gradien drawer ShConsole (siklus 407). */
export const DRAWER_GRADIENT = 'linear-gradient(180deg,#0c1220 0%,#0a0e18 100%)';

/** Judul panel ShConsole (#f2f6ff, siklus 407). */
export const TITLE_TEXT = '#f2f6ff';

/** Latar tab non-aktif ShConsole (#141c30, siklus 407). */
export const TAB_IDLE_BG = '#141c30';

/** Latar kartu ShConsole (#111827, siklus 407). */
export const CARD_BG = '#111827';

/** Garis putus-putus baris ShConsole (#1b2944, siklus 407). */
export const ROW_DASH = '#1b2944';

/** Tombol ghost ShConsole (#1a2340, siklus 407). */
export const GHOST_BG = '#1a2340';

/** Teks tombol ghost ShConsole (#c5d2ec, siklus 407). */
export const GHOST_TEXT = '#c5d2ec';

/** Teks tag ShConsole (#aebfe0, siklus 407). */
export const TAG_TEXT = '#aebfe0';

/** Teks error ShConsole (#ff8080, siklus 407). */
export const ERROR_TEXT = '#ff8080';

/** Latar blok output monospace ShConsole (#0a101c, siklus 407). */
export const PRE_BG = '#0a101c';

/** Latar tombol Tolak ShConsole (#4a2030, siklus 407). */
export const REJECT_BG = '#4a2030';

/** Teks peringatan stale ShConsole (#c2884e, siklus 407). */
export const STALE_TEXT = '#c2884e';

/**
 * Siklus 405 — border panel ShConsole (satu sumber).
 *
 * `#1e2a44` (biru gelap garis batas) sebelumnya literal 5× di ShConsole.jsx
 * (frame, header, tabbar, card, tag). Bukan warna status task — garis batas
 * panel konsol.
 */
export const PANEL_BORDER = '#1e2a44';

/** Teks lembut panel AgentInspector/SettingsModal (#cbd5e1, siklus 408). */
export const PANEL_SOFT_TEXT = '#cbd5e1';

/** Teks note/nama file TaskBoard-TeamStats-ProjectPanel (#cfd8e3, siklus 408). */
export const NOTE_TEXT = '#cfd8e3';

/** Teks judul item SettingsModal/TeamStats (#e2e8f0, siklus 408). */
export const ITEM_TITLE_TEXT = '#e2e8f0';

/** Teks gelap chip/tag beraksen (TaskBoard, #0b1320, siklus 408). */
export const CHIP_TEXT = '#0b1320';

/** rgb triplet hijau teal aksen (#10E5A0) — chip audio & kartu task on-time. */
export const GREEN_RGB = '16,229,160';

/** rgba(alpha 0..1) di atas hijau teal — komposisi satu sumber. */
export function greenAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${GREEN_RGB},${v})`;
}

/** rgba putih semi-transparan (overlay/border netral UI) — siklus 412.
 *  Sebelumnya literal `rgba(255,255,255,x)` tersebar di SettingsModal &
 *  AgentInspector; satu titik kebenaran agar alpha tak diketik ulang. */
export function whiteAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(255,255,255,${v})`;
}

/** rgb triplet cyan neon CYAN_NEON (#00F0FF) — hover baris kartu agen. */
export const CYAN_RGB = '0,240,255';

/** rgba(alpha 0..1) di atas cyan neon — komposisi satu sumber. */
export function cyanAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${CYAN_RGB},${v})`;
}

/** rgb triplet amber AMBER_ACCENT (#F59E0B) — kartu pending/attention. */
export const AMBER_RGB = '245,158,11';

/** rgba(alpha 0..1) di atas amber — komposisi satu sumber. */
export function amberAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${AMBER_RGB},${v})`;
}

/** rgba(alpha 0..1) di atas emas GOLD_ACCENT (#d8bb84) — kartu catatan. */
export const GOLD_RGB = '216,187,132';

/** rgba(alpha 0..1) hitam semi-transparan (overlay/bayangan) — siklus 413. */
export function shadowAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(0,0,0,${v})`;
}

/** rgba(alpha 0..1) di atas emas — komposisi satu sumber. */
export function goldAlpha(a) {
  const v = Number(a);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null; // anti-poisoning
  return `rgba(${GOLD_RGB},${v})`;
}

/** Teks inisial avatar aksen AgentInspector (#020713, siklus 408). */
export const AVATAR_TEXT = '#020713';

/** Latar header widget CS (#0d1522, siklus 408). */
export const CS_HEADER_BG = '#0d1522';

/** Aksen emas ProjectPanel (#d8bb84, siklus 408). */
export const GOLD_ACCENT = '#d8bb84';

/** Titik status proyek idle Dashboard (#9aa3b5, siklus 408). */
export const IDLE_DOT = '#9aa3b5';

/** Teks putih murni di atas panel gelap / tombol aksen (siklus 409). */
export const PURE_TEXT = '#ffffff';

/** Fallback netral garis status tak dikenal (#888888, siklus 409). */
export const UNKNOWN_STROKE = '#888888';

/** Cincin mutiara fallback OrbitalSculpture (siklus 410). */
export const PEARL_LIGHT = '#f7fbff';
export const PEARL_MID = '#a7bdce';
export const PEARL_DEEP = '#56718b';
export const PEARL_EDGE = '#e0e9ef';

/** Cincin kuningan fallback OrbitalSculpture (siklus 410). */
export const BRASS_LIGHT = '#f5dfb6';
export const BRASS_DEEP = '#ad7d40';
export const BRASS_MID = '#eac99a';

/** Garis bayangan & cincin dalam fallback OrbitalSculpture (siklus 410). */
export const RING_SHADOW = '#728a9e';
export const RING_DEEP = '#426788';

/**
 * Siklus 418 — palet layar monitor kanvas scene (satu sumber).
 *
 * Literal di painter layar effects.js (SCREEN_RENDERERS + drawScreenFrame):
 *   SCREEN_BG   #0b1220  latar reset tiap frame
 *   SCREEN_OK   #4ade80  teks/dot hijau (deploy, charts, monitor, bugs)
 *   SCREEN_WARN #fbbf24  bar DISK monitor
 *   SCREEN_INFO #60a5fa  bar NET monitor ( lowercase #60a5fa ≠ review #60A5FA
 *                        hanya kapitalisasi — warna sama; tetap dipisah agar
 *                        evolusi layar vs status task tak saling tarik )
 *   SCREEN_FAIL #f87171  chip FAIL QA (red-400, bukan failed #EF4444)
 *   SCREEN_PALETTE      swatch layar 'palette' (6 warna desain)
 */
export const SCREEN_BG = '#0b1220';
export const SCREEN_OK = '#4ade80';
export const SCREEN_WARN = '#fbbf24';
export const SCREEN_INFO = '#60a5fa';
export const SCREEN_FAIL = '#f87171';
export const SCREEN_PALETTE = Object.freeze([
  '#e879f9', '#fb7185', '#8b5cf6', SCREEN_INFO, '#22d3ee', SCREEN_OK,
]);

/**
 * Siklus 419 — palet jam dinding kanvas (satu sumber).
 *
 * Literal di clock_canvas.js & clock_spec.js (HANDS): latar #fafafa,
 * bingkai #2a2f36, pin/jarum detik #f97316 (oranye — BUKAN AMBER_ACCENT
 * #F59E0B; dipisah agar evolusi jam vs status tak saling tarik, pola sama
 * dgn SCREEN_INFO vs CYAN_NEON siklus 418), jarum jam #222 / menit #444.
 */
export const CLOCK_BG = '#fafafa';
export const CLOCK_RIM = '#2a2f36';
export const CLOCK_PIN = '#f97316';
export const HAND_HOUR_COLOR = '#222';
export const HAND_MINUTE_COLOR = '#444';

/**
 * Siklus 421 — palet status live agen (satu sumber) untuk STATUS_HEX
 * di scene/parts/agent_status.js (chip AgentInspector + dot label mengambang
 * label_spec.js). Warna historis terkunci:
 *   work  #10E5A0 = GREEN_ACCENT (aksen hijau teal, sama dgn plakat LEVEL 03)
 *   meet  #60A5FA = MEET_BLUE (biru review kanban; kapital — BUKAN SCREEN_INFO
 *                   #60a5fa, dipisah agar evolusi layar vs status tak saling
 *                   tarik, pola sama siklus 418/419)
 *   lunch #F59E0B = AMBER_ACCENT (chip running kanban)
 *   walk  #4D9FFF = ACCENT_BLUE (aksen kantor)
 *   dim   #8b93a3 = STATUS_DIM (abu netral; bukan SCENE_MUTED #8FA3BD)
 */
export const MEET_BLUE = '#60A5FA';
export const STATUS_DIM = '#8b93a3';

/**
 * Siklus 422 — warna identitas utama tiap agen (SATU SUMBER) untuk
 * scene/parts/agents_spec.js (AGENTS + AGENTS_EXTRA) & extended_desks.js
 * (EXTENDED_SPECIALISTS). Nilai historis terkunci — tampilan tidak berubah.
 */
export const AGENT_ID_COLORS = Object.freeze({
  'BANTUIN AI': '#10E5A0',
  BUDI: '#3B82F6',
  RIZKY: '#22D3EE',
  DEWI: '#F472B6',
  ANDI: '#FBBF24',
  YOGA: '#60A5FA',
  MAYA: '#A78BFA',
  TONI: '#34D399',
  RINA: '#FB7185',
  LINA: '#FB923C',
  SARI: '#F59E0B',
  'TRAINER AI': '#8B5CF6',
  'INTEGRATOR BOT': '#06B6D4',
  SUPPORT: '#84CC16',
  ARIS: '#00F0FF',
  CLARA: '#F472B6',
  RIAN: '#38BDF8',
  TARI: '#A855F7',
  FERRY: '#22D3EE',
  GILANG: '#00E5FF',
  HENDRA: '#34D399',
  DONI: '#10E5A0',
  SECBOT: '#EF4444',
  BAGAS: '#F87171',
  NINA: '#F59E0B',
  CITRA: '#FBBF24',
});

/** hex utama agen → numerik THREE (color) */
export function agentColorFromHex(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

/**
 * Siklus 423 — palet kanban (SATU SUMBER) untuk scene/parts/kanban_spec.js.
 * Nilai historis terkunci — tampilan tidak berubah. Blok frozen (pola
 * AGENT_ID_COLORS 422): duplikasi nilai antar-blok memang disengaja
 * (mis. #F97316 = CLOCK_PIN jam, #F59E0B = AMBER_ACCENT) agar evolusi
 * tiap domain tak saling tarik.
 */
export const KANBAN_COLUMN_BG = Object.freeze({
  pending: 'rgba(154, 167, 184, 0.12)',
  running: 'rgba(245, 158, 11, 0.12)',
  review: 'rgba(96, 165, 250, 0.12)',
  done: 'rgba(16, 229, 160, 0.12)',
});

export const KANBAN_PRIORITY_COLORS = Object.freeze({
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#94A3B8',
  normal: '#64748B',
});

export const KANBAN_PRIORITY_BG = Object.freeze({
  urgent: 'rgba(239, 68, 68, 0.16)',
  high: 'rgba(249, 115, 22, 0.16)',
  medium: 'rgba(234, 179, 8, 0.16)',
  low: 'rgba(148, 163, 184, 0.14)',
  normal: 'rgba(100, 116, 139, 0.12)',
});

export const KANBAN_TAG_PALETTE = Object.freeze([
  '#38BDF8', // sky-400
  '#818CF8', // indigo-400
  '#34D399', // emerald-400
  '#FBBF24', // amber-400
  '#F472B6', // pink-400
  '#A78BFA', // purple/violet-400
  '#60A5FA', // blue-400
  '#FB923C', // orange-400
  '#2DD4BF', // teal-400
  '#A3E635', // lime-400
  '#FB7185', // rose-400
]);

export const KANBAN_ROLE_COLORS = Object.freeze({
  be: '#3B82F6',
  fe: '#10B981',
  ops: '#EC4899',
  qa: '#A78BFA',
  pm: '#F59E0B',
  ai: '#06B6D4',
  sec: '#FB7185',
  sre: '#F97316',
});

export const KANBAN_TAG_PRESET_COLORS = Object.freeze({
  fullstack: '#60A5FA',
  devops: '#38BDF8',
  frontend: '#F472B6',
  backend: '#34D399',
  quality: '#FBBF24',
});

export const KANBAN_DIVISION_COLORS = Object.freeze({
  engineering: '#38BDF8',
  fullstack: '#818CF8',
  'platform-sec': '#34D399',
  'product-cs': '#F59E0B',
  'frontend-product': '#F472B6',
});

/** kontras badge: permukaan audit + fallback 'Semua' divisi (#10E5A0 = GREEN_ACCENT) */
export const KANBAN_AUDIT_SURFACE = '#151d2e';

// ─── SCENE ENVIRONMENT (siklus 424) ───
// warna lingkungan & pencahayaan scene 3D — nilai historis terkunci, OfficeScene.js delegasi
export const SCENE_SKY = 0x010A28;        // latar scene + fog exp2
export const SCENE_AMBIENT = 0xFFF5EB;    // AmbientLight warm
export const SCENE_SUN = 0xFFFAF0;        // DirectionalLight utama
export const SCENE_SKYFILL = 0x38BDF8;    // DirectionalLight fill biru
export const SCENE_HEMI_SKY = 0xF8FAFC;   // HemisphereLight langit
export const SCENE_HEMI_GROUND = 0x1E293B;
export const SCENE_GLASS = 0xBBCCDD;      // MeshPhysicalMaterial kaca
export const SCENE_CEIL_WHITE = 0xffffff; // langit-langit
export const SCENE_WALL_DEEP = 0x14243D;  // beam dinding tepi

// ─── DAYCYCLE / NEON (siklus 429) ───
// palet tint matahari + mode neon & restore (daycycle.js) — nilai historis terkunci
export const DC_SUN_TINT_BASE = 0xfff8f0;   // warna matahari netral hangat
export const DC_SUN_SUNSET = 0xffaa66;      // jingga sore 16:00-18:00
export const DC_SUN_MORNING = 0xffcc88;     // hangat pagi 05:00-07:00
export const DC_NEON_FLOOR = 0x1a2638;
export const DC_NEON_CARPET = 0x142033;
export const DC_NEON_TUBE_LIGHT = 0x00F0FF;
export const DC_NEON_TUBE_MESH = 0x18E0FF;
export const DC_NEON_CEIL_PANEL = 0x0A1526;
export const DC_NEON_SKY_WIN = 0x14213F;
export const DC_NEON_PEND_BULB = 0x16243D;
export const DC_NEON_PEND_LIGHT = 0x1E3A5F;
export const DC_RESTORE_FLOOR = 0xffffff;
export const DC_RESTORE_CARPET = 0xd0d8e0;
export const DC_RESTORE_TUBE_MESH = 0x334466;
export const DC_RESTORE_PEND_BULB = 0xffffff;
export const DC_RESTORE_PEND_LIGHT = 0xffe8cc;

// ─── FURNITURE DESK & CHAIR (siklus 425) ───
// palet perabot meja kerja + kursi (blok buildDesk OfficeScene.js) — nilai historis terkunci
export const FURN_DESK_TOP = 0xF5EBE1;    // papan atas meja oak skandinavia
export const FURN_DESK_LEG = 0x1E293B;    // kaki meja
export const FURN_MONO_METAL = 0xAABBCC;  // base+stand monitor / stand nameplate rm2
export const FURN_SCREEN_BODY = 0x1E1E24; // bodi monitor
export const FURN_INPUT_DARK = 0x2A2A30;  // keyboard + mouse
export const FURN_CHAIR_SEAT = 0x3B4A5A;  // dudukan kursi ergonomis
export const FURN_CHAIR_BACK = 0x2E3B48;  // sandaran kursi
export const FURN_PLATE_STAND = 0x2E3642; // stand nameplate (terpisah agar evolusi tak saling tarik)
export const FURN_CHAIR_POLE = 0x94A3B8;  // tiang kursi
export const FURN_CHAIR_BASE = 0x64748B;  // kaki silang kursi
export const FURN_CABINET = 0x46525E;     // laci kabinet bawah meja
export const FURN_DRAWER = 0x526270;      // laci dalam kabinet
export const FURN_HANDLE = 0x9AA7B4;      // handel laci
export const FURN_POT = 0xB08050;         // pot tanaman meja
export const FURN_LEAF = 0x43A047;        // daun tanaman


// ═══════════════════════════════════════════════════
// SIKLUS 426 — DUCT & TROPHY (OfficeScene.js)
// ═══════════════════════════════════════════════════
export const DUCT_LIGHT = 0xCCCCCC;       // duct utama melintang plafon
export const DUCT_CROSS = 0xBBBBBB;       // duct silang
export const DUCT_VENT = 0xDDDDDD;        // grille ventilasi
export const DUCT_LINE = 0xAAAAAA;        // garis grille vent
export const TUBE_NEON = 0x334466;        // tabung neon plafon (mode cyberpunk)
export const LEAD_MON_BODY = 0x2A2A2A;    // bodi monitor kedua meja lead
export const LEAD_MON_HEX = '#60A5FA';    // hex renderer sysdash monitor kedua
export const HELMET_BASE = 0x1A2A3A;      // alas trophy helm
export const HELMET_BODY = 0xDDDDDD;      // bodi trophy helm
export const RING_BLUE = 0x4D9FFF;        // visor/glow/cincin lantai meja lead
export const PARTICLE_WHITE = 0xFFFFFF;   // partikel debu ruangan

/** Terraces high-rise 3 lantai (siklus 427) — nilai historis terkunci. */
export const TERR_GLASS_RAIL = 0xCCE8FF;  // kaca balustrade transparan
export const TERR_WHITE = 0xFFFFFF;       // putih netral (material terrazzo map)
export const TERR_GOLD = 0xD4AF37;        // inlay/trim/handrail/ring emas
export const TERR_DL1_WARM = 0xFFE8CC;    // downlight hangat L1
export const TERR_SAND = 0xFAF8F5;        // pasir zen garden
export const TERR_PEBBLE = 0x334155;      // batu kali zen garden
export const TERR_TRUNK = 0x4A2E18;       // batang bonsai
export const TERR_FOLIAGE = 0x10B981;     // dedaunan bonsai
export const TERR_STEP_TREAD = 0x1F2C42;  // pijakan anak tangga
export const TERR_STEP_RISER = 0x162236;  // bidang tegak anak tangga
export const TERR_STRINGER = 0x0F172A;    // dinding samping tangga
export const TERR_STAIR_LED = 0x00E5FF;   // strip LED hidung anak tangga + downlight L2
export const TERR_LED_L2 = 0x00F0FF;      // LED neon cyan tepi L2 + pylon
export const TERR_LED_L3 = 0x10E5A0;      // LED emerald tepi L3 + downlight L3
export const TERR_PYLON = 0x182438;       // pilar struktural skyscraper
export const TERR_DARK_L1 = 0x162236;     // deck L1 mode gelap
export const TERR_DARK_L2 = 0x182842;     // deck L2 mode gelap
export const TERR_DARK_L3 = 0x121E30;     // deck L3 mode gelap
export const TERR_DAY_L1 = 0xF1F5F9;      // deck L1 mode terang
export const TERR_DAY_L2 = 0xE2E8F0;      // deck L2 mode terang
export const TERR_DAY_L3 = 0xCBD5E1;      // deck L3 mode terang

// ── Blok perabot area umum (siklus 428; nilai historis terkunci) ──
export const AMEN_DISP_BODY = 0xDFE6EE;   // badan dispenser
export const AMEN_DISP_BOTTLE = 0x7FB8EA; // galon dispenser
export const AMEN_DISP_TAP = 0x4A6A86;    // keran dispenser
export const AMEN_POT_BASE = 0xCFD8DC;    // dasar pot tanaman
export const AMEN_LEAF_A = 0x5FAE63;      // daun tanaman varian A
export const AMEN_LEAF_B = 0x2F7D3A;      // daun tanaman varian B
export const AMEN_SHELF = 0xCFD8E3;       // rak buku rendah
export const AMEN_BOOK_SPINES = [0x3F7CF0, 0xE8504F, 0xF0A42A, 0x7A4CF5, 0x16C07A]; // punggung buku
export const AMEN_PRINT_BODY = 0xB4B9BF;  // printer bawah
export const AMEN_PRINT_MID = 0xE2E5E8;   // printer tengah
export const AMEN_PRINT_TOP = 0xC7CCD1;   // printer atas
export const AMEN_PRINT_PAPER = 0xFAFAFA; // kertas tray printer
export const AMEN_PRINT_DARK = 0x2F3338;  // slot gelap printer
export const AMEN_PRINT_LED = 0x00E676;   // LED printer
export const AMEN_PRINT_SHEET = 0xFFFFFF; // lembar keluar printer
export const AMEN_SOFA_DARK = 0x35454F;   // sofa rangka+lengan
export const AMEN_SOFA_CUSHION = 0x475D69;// sofa dudukan/sandaran
export const AMEN_SOFA_TRAY = 0xDCE3EA;   // sofa meja samping
export const AMEN_SOFA_LEG = 0xB5C3D1;    // kaki meja samping sofa
export const AMEN_MAG_RED = 0xFF5252;     // magnet merah sofa
export const AMEN_MAG_BLUE = 0x448AFF;    // magnet biru sofa
export const AMEN_PANTRY_BODY = 0xDDE4EC; // pantry counter
export const AMEN_PANTRY_TOP = 0xE9EDF1;  // pantry top
export const AMEN_KOPI = 0x30343A;        // mesin kopi
export const AMEN_KOPI_DARK = 0x1F2226;   // mesin kopi gelap
export const AMEN_KOPI_TRIM = 0x666C72;   // trim mesin kopi
export const AMEN_KOPI_LED = 0x0DEEF3;    // LED mesin kopi
export const AMEN_CUP = 0xFFFFFF;         // cangkir putih
export const AMEN_JAR = [0xFF5252, 0xF5A623, 0x00E676]; // toples pantry
export const AMEN_PANTRY_BOX = 0xE3E6E9;  // kotak pantry
export const AMEN_MICRO_PANEL = 0x101214; // panel microwave
export const AMEN_POSTER_FRAME = 0x262A31;// bingkai poster dinding

// ── Blok dinding kampus (siklus 430; nilai historis terkunci) ──
export const WALL_NAVY = 0x24304A;        // lis dinding dalam
export const WALL_TRIM = 0xF4F6FA;        // trim putih statis (nilai lama NAVY deklarasi)
export const WALL_WIN_FRAME = 0x2B3446;   // frame jendela sky-view
export const WALL_PLANTER_BOX = 0x3A4A5E; // kotak bunga bawah jendela
export const WALL_FLOWER_DAY = [0xE86A92, 0xF2C14E, 0x7FC8A9, 0xF6F2EA];   // bunga siang
export const WALL_FLOWER_NIGHT = [0x5A2740, 0x6B4E1E, 0x1F4F3E, 0x3A4256];// bunga malam
export const WALL_LOGO_BACKDROP = 0x14243D; // panel belakang logo WFS
export const WALL_SPOT_BODY = 0x222222;   // badan lampu sorot logo
export const WALL_BULB_WARM = 0xFFE9A8;   // bulb sorot hangat
export const WALL_SPOT_WARM = 0xFFE2A0;   // PointLight sorot logo

// Blok STRUCT_* — siklus 431: struktur ruangan (karpet utama, wainscot band,
// trim wainscot, frame kaca tepi). Nilai historis terkunci — tampilan tak berubah.
export const STRUCT_CARPET = 0xD0D8E0;    // karpet utama area tengah
export const STRUCT_WAINSCOT = 0xEFE9DD;  // panel bawah dinding (band)
export const STRUCT_WAINSCOT_TRIM = 0xC9BFA8; // trim atas wainscot band
export const STRUCT_GLASS_FRAME = 0xAABBCC;   // frame kaca tepi struktur

// Blok RC_* — siklus 431: meja resepsionis & perlengkapan. Nilai historis terkunci.
export const RC_DESK_BODY = 0x1A2A3A;     // badan & sisi meja resepsionis
export const RC_DESK_TOP = 0xDDE4EC;      // permukaan atas meja
export const RC_GLOW_TEAL = 0x4D9FFF;     // glow strip + PointLight meja
export const RC_MON_BODY = 0x2A2A2A;      // bodi monitor resepsionis
export const RC_SCREEN_BG = 0x0A1628;     // latar layar monitor (glow)
export const RC_PERIPH_DARK = 0x333333;   // keyboard & mouse
export const RC_CHAIR_SHELL = 0x37474F;   // seat + back kursi resepsionis
export const RC_FOUNDER_HAIR = 0x1a1a1a;  // karakter NEXUS Founder — rambut
export const RC_FOUNDER_SHIRT = 0xB45309; // karakter NEXUS Founder — baju
export const RC_FOUNDER_PANTS = 0x292524; // karakter NEXUS Founder — celana
export const RC_FOUNDER_ACCENT = 0xF59E0B; // warna identitas Founder (color)
export const RC_FOUNDER_HEX = '#F59E0B';   // hex renderer label/badge Founder
export const RC_FOUNDER_FALLBACK_HEX = '#38BDF8'; // fallback label saat agen tanpa hex

// Blok SR_* — siklus 432: ruang server & water cooler. Nilai historis terkunci.
export const SR_RACK_BODY = 0x2E3244;     // badan rak server
export const SR_RACK_EDGE = 0x00E5FF;     // strip cahaya tepi rak (breath)
export const SR_RACK_UNIT = 0x3A3F55;     // unit 1U rak server
export const SR_LED_COLORS = [0x00E676, 0xFFC107, 0x2979FF]; // LED strip rak
export const SR_PLINTH = 0x1A1D28;        // plinth kontak bawah rak
export const SR_LIGHT_CYAN = 0x00BCD4;    // PointLight ruang server
export const SR_BULB = 0xB2EBF2;          // bulb lampu ruang server
export const SR_CABLE = 0x333344;         // kabel bundel lantai
export const SR_COOLER_BODY = 0xE0E0E0;   // badan water cooler
export const SR_COOLER_JUG = 0x4FC3F7;    // galon air cooler
export const SR_COOLER_TAP = 0x607D8B;    // keran cooler
export const SR_BUBBLE = 0x81D4FA;        // gelembung air di jug

// Blok CA_* — siklus 433: kafe/coffee bar Lantai 3. Nilai historis terkunci.
export const CA_COUNTER_WOOD = 0x6D4C41;  // counter L-shape kayu
export const CA_COUNTERTOP = 0xFFECB3;    // permukaan countertop
export const CA_ESPRESSO_BODY = 0x263238; // badan mesin espresso
export const CA_ESPRESSO_LED = 0x10E5A0;  // LED mesin espresso
export const CA_STEAM = 0xffffff;         // kepala uap kopi
export const CA_KETTLE = 0x90A4AE;        // kettle logam
export const CA_CUP_RED = 0xEF5350;       // cangkir merah (varian 0)
export const CA_CUP_WHITE = 0xFAFAFA;     // cangkir putih
export const CA_MENU_BACK = 0x2A2A2A;     // bingkai menu board
export const CA_STOOL_SEAT = 0xFB8C00;    // dudukan bar stool oranye
export const CA_STOOL_METAL = 0x555555;   // tiang + kaki bar stool
export const CA_FRIDGE_BODY = 0xECEFF1;   // badan snack fridge
export const CA_FRIDGE_GLOW = 0x4FC3F7;   // glow panel fridge

// Blok LG_* — siklus 433: welcome lounge Lantai 3. Nilai historis terkunci.
export const LG_RUG_OUT = 0x8D5524;       // karpet lounge luar
export const LG_RUG_IN = 0xC98A3D;        // karpet lounge dalam
export const LG_TABLE_WOOD = 0x6D4C41;    // bodi coffee table (terpisah dari CA_COUNTER_WOOD)
export const LG_TABLE_GLASS = 0xB0BEC5;   // top kaca coffee table
export const LG_LEG_WOOD = 0x4E342E;      // kaki coffee table + kursi
export const LG_MAG_COVER = 0xF4511E;     // sampul majalah (terpisah dari LG_MAGS[0])
export const LG_MUG = 0xFAFAFA;           // mug putih (terpisah dari CA_CUP_WHITE)
export const LG_CHAIR_SHELL = 0x00695C;   // seat + back kursi santai
export const LG_CHAIR_CUSHION = 0x26A69A; // bantal kursi santai
export const LG_LAMP_POLE = 0x37474F;     // tiang lampu berdiri
export const LG_LAMP_SHADE = 0xFFE0B2;    // shade lampu hangat
export const LG_LAMP_BULB = 0xFFC97A;     // PointLight lampu berdiri
export const LG_MAG_RACK = 0x5D4037;      // rak majalah
export const LG_MAGS = [0xF4511E, 0x1E88E5, 0x43A047]; // sampul 3 majalah rak
export const LG_TV_FRAME = 0x101418;      // bingkai TV info

// Blok FX_* — siklus 434: efek meja & dokumen melayang (effects.js). Nilai historis terkunci.
export const FX_PAGE_TINTS = [0x22d3ee, 0xfbbf24, 0x4ade80, 0xe879f9, 0x60a5fa, 0xfb923c, 0x8b5cf6, 0xf87171, 0xfff3d6]; // warna dokumen melayang
export const FX_POT_CLAY = 0xc4b5ae;      // pot tanaman mini
export const FX_LEAF = 0x57a85b;          // daun tanaman mini
export const FX_HP_BAND = 0x2f3236;       // band headphone
export const FX_HP_CUP = 0x1d1f22;        // earcup headphone

// ── EX_LOOK_*: outfit (hair/shirt/pants) 12 spesialis extended desks — siklus 436 ──
export const EX_ARIS = { hair: 0x222222, shirt: 0x0E7490, pants: 0x164E63 };
export const EX_CLARA = { hair: 0x4A148C, shirt: 0xBE185D, pants: 0x1A1A2E };
export const EX_RIAN = { hair: 0x1E293B, shirt: 0x0284C7, pants: 0x0F172A };
export const EX_TARI = { hair: 0x312E81, shirt: 0x7E22CE, pants: 0x1E1B4B };
export const EX_FERRY = { hair: 0x1E293B, shirt: 0x0891B2, pants: 0x0F172A };
export const EX_GILANG = { hair: 0x111827, shirt: 0x0369A1, pants: 0x1E293B };
export const EX_HENDRA = { hair: 0x111827, shirt: 0x059669, pants: 0x1E293B };
export const EX_DONI = { hair: 0x1F2937, shirt: 0x047857, pants: 0x064E3B };
export const EX_SECBOT = { hair: 0x000000, shirt: 0xB91C1C, pants: 0x18181B };
export const EX_BAGAS = { hair: 0x450A0A, shirt: 0x991B1B, pants: 0x18181B };
export const EX_NINA = { hair: 0x3E2723, shirt: 0xD97706, pants: 0x292524 };
export const EX_CITRA = { hair: 0x78350F, shirt: 0xB45309, pants: 0x451A03 };

// ── AG_LOOK_*: outfit (hair/shirt/pants) 14 agen — siklus 435 ──
export const AG_BANTUIN = { hair: 0x1a1a2e, shirt: 0x0B4F3A, pants: 0x08281F };
export const AG_BUDI = { hair: 0x222222, shirt: 0x1E3A8A, pants: 0x111827 };
export const AG_RIZKY = { hair: 0x1a1a1a, shirt: 0x155E75, pants: 0x164E63 };
export const AG_DEWI = { hair: 0x4A148C, shirt: 0x9D174D, pants: 0x1a1a2e };
export const AG_ANDI = { hair: 0x3E2723, shirt: 0x92400E, pants: 0x263238 };
export const AG_YOGA = { hair: 0x111111, shirt: 0x1D4ED8, pants: 0x1F2937 };
export const AG_MAYA = { hair: 0x4E342E, shirt: 0x6D28D9, pants: 0x1a1a2e };
export const AG_TONI = { hair: 0x263238, shirt: 0x065F46, pants: 0x212121 };
export const AG_RINA = { hair: 0x5D1A1A, shirt: 0x9F1239, pants: 0x1F2937 };
export const AG_LINA = { hair: 0x3E2723, shirt: 0xC2410C, pants: 0x292524 };
export const AG_SARI = { hair: 0x2D1B0E, shirt: 0xB45309, pants: 0x1C1917 };
export const AG_TRAINER = { hair: 0x111827, shirt: 0x4C1D95, pants: 0x1E1B4B };
export const AG_INTEGRATOR = { hair: 0x0F172A, shirt: 0x155E75, pants: 0x083344 };
export const AG_SUPPORT = { hair: 0x3B2412, shirt: 0x3F6212, pants: 0x1A2E05 };

// ── LK_*: skin warna kulit karakter — siklus 438.──
export const LK_BANTUIN = 0xCFD8DC;
export const LK_BUDI = 0xD9A273;
export const LK_RIZKY = 0xE8B88A;
export const LK_DEWI = 0xF1C9A0;
export const LK_ANDI = 0xC68B5E;
export const LK_YOGA = 0xE0AC7E;
export const LK_MAYA = 0xF3D2B0;
export const LK_TONI = 0xB97F55;
export const LK_RINA = 0xEBC39A;
export const LK_LINA = 0xF0C8A2;
export const LK_SARI = 0xD9A273;
export const LK_WAHYU = 0xE8B88A;
export const LK_TRAINER = 0xB39DDB;
export const LK_INTEGRATOR = 0x90CAF9;
export const LK_SUPPORT = 0xCFA27F;
export const LK_FALLBACK = 0xE8B88A;

export const TEAM_BACKEND   = { color: '#22D3EE', hex: '#22D3EE' };
export const TEAM_FRONTEND  = { color: '#F472B6', hex: '#F472B6' };
export const TEAM_DEVOPS    = { color: '#34D399', hex: '#34D399' };
export const TEAM_QAGOV     = { color: '#FB7185', hex: '#FB7185' };
export const TEAM_PROD      = { color: '#F59E0B', hex: '#F59E0B' };
export const TEAM_AICS      = { color: '#10E5A0', hex: '#10E5A0' };

// ── LC_*: kanvas logo WFS Project — siklus 439 (nilai historis terkunci).──
export const LC_BG = '#0F1B2E';
export const LC_FRAME = '#D4AF37';
export const LC_GRAD_A = '#FBBF24';
export const LC_GRAD_B = '#F97316';
export const LC_TEXT = '#FFFFFF';
export const LC_TAGLINE = 'rgba(255,255,255,.75)';
export const LC_TITLE_NIGHT_W = '#7E90B4';
export const LC_TITLE_NIGHT_P = '#8A5E1A';
export const TITLE_DAY = { w: LC_TEXT, p: '#F59E0B' };

/* ===== RB_* — palet robot.js (siklus 443, nilai historis terkunci) ===== */
export const RB_TORSO = 0xd5dde5;   // torso logam terang
export const RB_HEAD = 0xe6edf3;    // kepala kapsul
export const RB_ANTENNA = 0x556070; // batang antena
export const RB_WHITE = 0xffffff;   // lampu status + bola antena

/* ===== DC_* — palet decor.js (siklus 442, nilai historis terkunci) ===== */
export const DC_POT_CLAY = 0x8B5E3C;      // pot tanaman sudut
export const DC_LEAF_A = 0x2E7D32;        // daun ganjil
export const DC_LEAF_B = 0x43A047;        // daun genap
export const DC_GLASS = 0x9ad8ff;         // partisi kaca antar tim (opacity .18)
export const DC_RUG_OUTER = 0x1565C0;     // rug tengah biru luar (opacity .85)
export const DC_RUG_INNER = 0xEF6C00;     // rug tengah oranye dalam (opacity .85)
export const DC_LOUNGE_LIGHT = 0xFFC97A;  // PointLight lampu lantai lounge

/* ===== WS_* — palet whiteboard_spec.js (siklus 444, nilai historis terkunci) ===== */
export const WS_TRAY = 0x8a9ca6;    // baki spidol
export const WS_MARKER_BLACK = 0x1e293b;
export const WS_MARKER_BLUE = 0x2563eb;
export const WS_MARKER_RED = 0xef4444;
export const WS_MARKER_GREEN = 0x16a34a;
export const WS_ERASER = 0x475569;  // penghapus papan

// ── PD_*: pedestal dasar kampus — siklus 445 (nilai historis terkunci).──
export const PD_PLINTH = 0x0D1B2E;  // plinth — lebih terang dari void 0x010A28
export const PD_LIP = 0xD4AF37;     // garis emas bibir atas (bahasa trim terraces)
export const PD_GLOW = 0x00E5FF;    // glow rim cyan (bahasa LED L2)

// ── FZ_*: zona lantai L1 — siklus 445 (nilai historis terkunci).──
export const FZ_DEV_DESK = 0x1E3A5F;
export const FZ_MEETING = 0x4A3A1A;
export const FZ_LOUNGE = 0x143326;
export const FZ_CAFE = 0x2E1533;
export const FZ_SERVER = 0x1F1F2E;

// ═══ SIKLUS 446 — AKSESORI & WAJAH KARAKTER (OfficeScene.js addAccessories/buildChar)
// nilai historis terkunci — jangan ubah nilainya (perubahan visual butuh keputusan eksplisit)
export const AG_GLASSES_DARK = 0x111111;  // lensa kacamata + peci
export const AG_SKIN_CREAM = 0xF5F0E6;    // fallback kulit (bila LOOKS tak ada)
export const AG_HAT_BRIM = 0x27303F;      // brim topi
export const AG_BEANIE = 0x37474F;        // beanie
export const AG_CAP_TOP = 0x212121;       // tudung/topi gelap
export const AG_BEARD = 0x222222;         // jenggot
export const AG_ANTENNA_ROD = 0x90A4AE;   // batang antena aksesori
export const AG_BLAZER = 0x263238;        // blazer
export const AG_SHIRT_WHITE = 0xFFFFFF;   // kemeja blazer, sol sepatu, mata, glint
export const AG_TIE = 0x7F1D1D;           // dasi
export const AG_PANTS_MATCH_A = 0x08281F; // pants dikenali → normalisasi
export const AG_PANTS_MATCH_B = 0x111827; // pants dikenali → normalisasi
export const AG_PANTS_MATCH_C = 0x212121; // pants dikenali → normalisasi
export const AG_PANTS_DEFAULT = 0x1E293B; // hasil normalisasi celana
export const AG_PANTS_FALLBACK = 0x334155; // fallback celana
export const AG_BLUSH = 0xFCA5A5;         // blush pipi
export const AG_PUPIL = 0x1E293B;         // pupil
export const AG_MOUTH = 0xB45309;         // mulut
export const AG_LANYARD = 0x35507A;       // tali ID card

// ═══ SIKLUS 447 — TANDA DEKORATIF (sign_canvas.js: menu, poster, welcome)
// nilai historis terkunci — jangan ubah nilainya (perubahan visual butuh keputusan eksplisit)
export const SG_MENU_BG = '#1A1A2E';      // latar papan menu café
export const SG_MENU_HI = '#FFE082';      // baris menu ter-highlight
export const SG_MENU_TEXT = '#EEE';       // baris menu biasa
export const SG_POSTER_BG = '#0f1a2e';    // latar poster motivasi

// ═══ SIKLUS 448 — POSTER DINDING (poster_spec.js)
// nilai historis terkunci — jangan ubah nilainya (perubahan visual butuh keputusan eksplisit)
export const PS_SHIP = '#0deef3';       // SHIP IT
export const PS_KUALITAS = '#f5a623';   // KUALITAS DULU
export const PS_BUILD = '#ff5252';      // BUILD DAILY
export const PS_TEST = '#7c4dff';       // TEST EVERYTHING
export const PS_WFS = '#00e676';        // WFS PROJECT
export const PS_FOKUS = '#ffca28';      // FOKUS
export const PS_SELESAIKAN = '#40c4ff'; // SELESAIKAN
export const PS_ANTAR = '#ff80ab';      // ANTAR TEPAT WAKTU

// ═══ SIKLUS 449 — LABEL & RESEPSIONIS (sisa literal hex scene) — nilai terkunci
// ZL_TEXT tak didefinisikan di sini (reuse LC_TEXT, re-export di zone_label_canvas.js)
export const LB_TEXT = '#fff';           // nama agen di nameplate (label_spec.js)
export const LB_ROLE = '#b8c4d4';        // jabatan agen di nameplate full

// ═══ SIKLUS 450 — RAK BUKU (bookshelf.js) — nilai historis terkunci
// jangan ubah nilainya (perubahan visual butuh keputusan eksplisit)
export const BK_FRAME = 0x5D4037;        // rangka rak
export const BK_BOARD = 0x8D6E63;        // papan tingkat buku
export const BK_BOOK_1 = 0xEF5350;       // merah
export const BK_BOOK_2 = 0xFFCA28;       // kuning
export const BK_BOOK_3 = 0x42A5F5;       // biru
export const BK_BOOK_4 = 0x66BB6A;       // hijau
export const BK_BOOK_5 = 0xAB47BC;       // ungu
export const BK_BOOK_6 = 0xFF7043;       // oranye
export const BK_BOOK_7 = 0x26C6DA;       // teal
export const BK_BOOK_8 = 0xEC407A;       // pink
