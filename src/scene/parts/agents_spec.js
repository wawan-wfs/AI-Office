// Data identitas 14 agen kantor — diekstrak dari OfficeScene.js agar dapat
// di-unit-test (warna, role, screen, penampilan) tanpa memuat THREE.
// Prinsip: data murni; pemakaian (render mesh, nameplate) tetap di OfficeScene.js.
//
// Siklus 422: warna identitas utama (hex/color) SATU SUMBER dari
// ui_palette.js AGENT_ID_COLORS; hair/shirt/pants tetap literal per agen
// (outfit unik, bukan bagian palet UI).
//
// Siklus 435: outfit (hair/shirt/pants) delegasi AG_* di ui_palette.js —
// 0 literal hex tersisa; nilai historis terkunci.

import {
  AGENT_ID_COLORS, agentColorFromHex,
  AG_BANTUIN, AG_BUDI, AG_RIZKY, AG_DEWI, AG_ANDI, AG_YOGA, AG_MAYA, AG_TONI,
  AG_RINA, AG_LINA, AG_SARI, AG_TRAINER, AG_INTEGRATOR, AG_SUPPORT,
} from '../../lib/ui_palette.js';

function agent(name, role, screen, look) {
  const hex = AGENT_ID_COLORS[name];
  return { name, color: agentColorFromHex(hex), hex, role, screen, ...look };
}

export const AGENTS = [
  agent('BANTUIN AI', 'AI Customer Service', 'terminal', AG_BANTUIN),
  agent('BUDI', 'Backend Engineer', 'charts', AG_BUDI),
  agent('RIZKY', 'Backend Engineer', 'terminal', AG_RIZKY),
  agent('DEWI', 'Frontend Engineer', 'palette', AG_DEWI),
  agent('ANDI', 'Frontend Engineer', 'deploy', AG_ANDI),
  agent('YOGA', 'Mobile Engineer', 'map', AG_YOGA),
  agent('MAYA', 'UI/UX Designer', 'docs', AG_MAYA),
  agent('TONI', 'DevOps Engineer', 'bugs', AG_TONI),
];

export const AGENTS_EXTRA = [
  agent('RINA', 'QA Engineer', 'bugs', AG_RINA),
  agent('LINA', 'Growth Marketing', 'charts', AG_LINA),
  agent('SARI', 'Project Manager', 'board', AG_SARI),
  agent('TRAINER AI', 'AI Knowledge Engineer', 'terminal', AG_TRAINER),
  agent('INTEGRATOR BOT', 'Integration Engineer', 'terminal', AG_INTEGRATOR),
  agent('SUPPORT', 'Customer Success', 'docs', AG_SUPPORT),
];

export const SCREENS = ['terminal','charts','palette','deploy','map','docs','bugs','board'];

export function allAgents(a = AGENTS, extra = AGENTS_EXTRA) {
  return [...a, ...extra];
}
