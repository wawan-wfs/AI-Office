// Profil tampilan per karakter kantor (data murni, tanpa THREE).
// skin = warna kulit (hex), h = pengali tinggi sprite, acc = daftar aksesori.
// Diuji agar identitas visual karakter (aksesori/tinggi) tidak regresi.

import { LK_BANTUIN, LK_BUDI, LK_RIZKY, LK_DEWI, LK_ANDI, LK_YOGA, LK_MAYA, LK_TONI, LK_RINA, LK_LINA, LK_SARI, LK_WAHYU, LK_TRAINER, LK_INTEGRATOR, LK_SUPPORT, LK_FALLBACK } from '../../lib/ui_palette.js';

export const LOOKS = {
  'BANTUIN AI':{skin:LK_BANTUIN,h:1.0,acc:['visor','antenna']},
  'BUDI':{skin:LK_BUDI,h:1.05,acc:['glasses','beard']},
  'RIZKY':{skin:LK_RIZKY,h:1.02,acc:['headphones']},
  'DEWI':{skin:LK_DEWI,h:.97,acc:['hijab']},
  'ANDI':{skin:LK_ANDI,h:1.04,acc:['cap']},
  'YOGA':{skin:LK_YOGA,h:1.0,acc:['glasses']},
  'MAYA':{skin:LK_MAYA,h:.96,acc:['bun','glasses']},
  'TONI':{skin:LK_TONI,h:1.07,acc:['beanie','beard']},
  'RINA':{skin:LK_RINA,h:.97,acc:['hijab','glasses']},
  'LINA':{skin:LK_LINA,h:.98,acc:['ponytail']},
  'SARI':{skin:LK_SARI,h:.99,acc:['blazer','glasses']},
  'WAHYU FS':{skin:LK_WAHYU,h:1.04,acc:['tie','peci']},
  'TRAINER AI':{skin:LK_TRAINER,h:.98,acc:['visor','headphones']},
  'INTEGRATOR BOT':{skin:LK_INTEGRATOR,h:1.06,acc:['antenna']},
  'SUPPORT':{skin:LK_SUPPORT,h:1,acc:['blazer']},
};

export const FALLBACK = {skin:LK_FALLBACK,h:1,acc:[]};

// Pencarian case-insensitive berdasarkan nama agent; nama tak dikenal → fallback.
export function looksOf(agent){const L=LOOKS[String(agent?.name||'').toUpperCase()];return L?{...L,acc:[...L.acc]}:{skin:FALLBACK.skin,h:FALLBACK.h,acc:[]}}
