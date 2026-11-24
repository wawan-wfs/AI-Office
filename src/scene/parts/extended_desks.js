// parts/extended_desks.js — Workstation Pods & Specialist Agents Kampus WFS PROJECT
// 12 spesialis tambahan pada sayap Barat & Timur (x = ±10.5 / ±13.5 — DI DALAM dinding 34m),
// tersusun terasering per lantai: L1 z=-5 (Atrium), L2 z=1 (Mezzanine), L3 z=7 (Penthouse).
//
// Siklus 422/436: warna identitas + outfit (hair/shirt/pants) SATU SUMBER
// dari ui_palette.js (AGENT_ID_COLORS + blok EX_*).

import {
  AGENT_ID_COLORS, agentColorFromHex,
  EX_ARIS, EX_CLARA, EX_RIAN, EX_TARI,
  EX_FERRY, EX_GILANG, EX_HENDRA, EX_DONI,
  EX_SECBOT, EX_BAGAS, EX_NINA, EX_CITRA,
} from '../../lib/ui_palette.js';

function specialist(name, role, screen, floor, look, desk) {
  const hex = AGENT_ID_COLORS[name];
  return { name, color: agentColorFromHex(hex), hex, role, screen, floor, ...look, desk };
}

export const EXTENDED_SPECIALISTS = [
  // ── LANTAI 1: Product & Strategy Atrium (Y = 0, z = -5) ──
  specialist('ARIS', 'Solution Architect', 'palette', 1, EX_ARIS, { x: -13.5, z: -5 }),
  specialist('CLARA', 'UX Researcher', 'docs', 1, EX_CLARA, { x: -10.5, z: -5 }),
  specialist('RIAN', 'Product Strategist', 'board', 1, EX_RIAN, { x: 10.5, z: -5 }),
  specialist('TARI', 'Visual Designer', 'palette', 1, EX_TARI, { x: 13.5, z: -5 }),

  // ── LANTAI 2: Core Engineering & Cloud Pods (Y = 0.60, z = 1) ──
  specialist('FERRY', 'Database Engineer', 'charts', 2, EX_FERRY, { x: -13.5, z: 1 }),
  specialist('GILANG', 'Senior Backend Lead', 'terminal', 2, EX_GILANG, { x: -10.5, z: 1 }),
  specialist('HENDRA', 'Cloud Infra Engineer', 'deploy', 2, EX_HENDRA, { x: 10.5, z: 1 }),
  specialist('DONI', 'Site Reliability Eng', 'charts', 2, EX_DONI, { x: 13.5, z: 1 }),

  // ── LANTAI 3: Quality, Security & Delivery Penthouse (Y = 1.20, z = 7) ──
  specialist('SECBOT', 'Security Engineer', 'bugs', 3, EX_SECBOT, { x: -13.5, z: 7 }),
  specialist('BAGAS', 'DevSecOps Specialist', 'terminal', 3, EX_BAGAS, { x: -6.0, z: 8.8 }),
  specialist('NINA', 'Release Manager', 'board', 3, EX_NINA, { x: 6.0, z: 8.8 }),
  specialist('CITRA', 'Quality Governance Lead', 'docs', 3, EX_CITRA, { x: 13.5, z: 7 }),
];
