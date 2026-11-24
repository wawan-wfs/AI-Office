// parts/reception.js — builder murni RECEPTION DESK (meja + logo WFS, monitor,
// kursi, karakter NEXUS "WAHYU FS", label Founder, glow teal + PointLight).
// Diekstrak 1:1 dari OfficeScene.js (urutan/posisi/warna identik; tampilan tak berubah).
// Pola sama cafe/serverroom/lounge/bookshelf: konteks di-inject, tanpa dependensi global.
// Footprint meja didaftarkan ke OBSTACLES agar agen tak berjalan menembus meja.
import { OBSTACLES } from './obstacles.js';
import { uiTexture, uiMaterial } from './ui_colorspace.js';
import { LS_W, LS_H, drawLobbyScreen } from './lobby_screen.js'; // siklus 525: layar lobi live
import { FURN_MONO_METAL, FURN_CHAIR_POLE, FURN_CHAIR_BASE, LEAD_MON_BODY, HELMET_BASE, RING_BLUE, RC_DESK_BODY, RC_DESK_TOP, RC_GLOW_TEAL, RC_MON_BODY, RC_SCREEN_BG, RC_PERIPH_DARK, RC_CHAIR_SHELL, RC_FOUNDER_HAIR, RC_FOUNDER_SHIRT, RC_FOUNDER_PANTS, RC_FOUNDER_ACCENT, AMBER_ACCENT } from '../../lib/ui_palette.js';

export function createReception({ THREE, office, M, MB, drawResepsiLogo, makeLabel, buildChar, looksOf, blobMat }) {
  const reception = new THREE.Group();
  const RCX = 8, RCZ = 6.5;
  // Main desk body (curved front)
  const rcDesk = new THREE.Mesh(new THREE.BoxGeometry(2.5, .9, .6), M(RC_DESK_BODY));
  rcDesk.position.set(RCX, .45, RCZ); rcDesk.castShadow = true; reception.add(rcDesk);
  if (blobMat) {
    const rcShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.2), blobMat);
    rcShadow.rotation.x = -Math.PI / 2;
    rcShadow.position.set(RCX, 0.012, RCZ);
    rcShadow.renderOrder = 2;
    rcShadow.userData.blob = true;
    reception.add(rcShadow);
  }
  // Top surface
  const rcTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, .7), M(RC_DESK_TOP));
  rcTop.position.set(RCX, .92, RCZ); rcTop.castShadow = true; reception.add(rcTop);
  // Side panel
  const rcSide = new THREE.Mesh(new THREE.BoxGeometry(.6, .9, .04), M(RC_DESK_BODY));
  rcSide.position.set(RCX + 1.25, .45, RCZ - .3); rcSide.castShadow = true; reception.add(rcSide);
  // Footprint resepsionis didaftarkan ke OBSTACLES (obstacles.js) supaya
  // freeSpot/destinasi jalan tidak pernah menempatkan agen DI DALAM meja.
  OBSTACLES.push([RCX - 1.3, RCX + 1.55, RCZ - .35, RCZ + .35]);

  // Logo WFS Project di depan meja resepsionis
  const wfsLogoTex = (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 320; const x = c.getContext('2d');
    drawResepsiLogo(x);
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; uiTexture(t); return t;
  })();
  const rcLogoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .5625), uiMaterial(new THREE.MeshBasicMaterial({ map: wfsLogoTex, transparent: true })));
  rcLogoMesh.position.set(RCX, .5, RCZ + .31); reception.add(rcLogoMesh);
  const rcLogoFront = rcLogoMesh.clone(); rcLogoFront.position.set(RCX, .5, RCZ - .31); rcLogoFront.rotation.y = Math.PI; reception.add(rcLogoFront);

  // Teal glow strip under desk front
  const rcGlow = new THREE.Mesh(new THREE.BoxGeometry(2.2, .02, .02), MB(RC_GLOW_TEAL));
  rcGlow.material.transparent = true; rcGlow.material.opacity = 1; // siklus 494: bernapas via receptionGlow
  rcGlow.position.set(RCX, .05, RCZ + .3); reception.add(rcGlow);
  const rcLight = new THREE.PointLight(RC_GLOW_TEAL, 0.4, 3.5, 2);
  rcLight.position.set(RCX, .1, RCZ + .5); reception.add(rcLight);

  // Reception monitor (behind desk, facing NEXUS)
  const rcMonBase = new THREE.Mesh(new THREE.BoxGeometry(.2, .02, .1), M(FURN_MONO_METAL));
  rcMonBase.position.set(RCX - .4, .95, RCZ + .05); reception.add(rcMonBase);
  const rcMonStand = new THREE.Mesh(new THREE.BoxGeometry(.03, .18, .03), M(FURN_MONO_METAL));
  rcMonStand.position.set(RCX - .4, 1.05, RCZ + .05); reception.add(rcMonStand);
  const rcMonBody = new THREE.Mesh(new THREE.BoxGeometry(.6, .4, .03), M(RC_MON_BODY));
  rcMonBody.position.set(RCX - .4, 1.35, RCZ + .08); reception.add(rcMonBody);
  // Screen glow
  // Siklus 525: layar monitor resepsionis LIVE — dulu kotak datar; warna kini RC_SCREEN_BG/RC_MON_BODY
  // (satu-satunya layar kosong di kantor). Kanvas 256×160 + painter murni
  // lobby_screen.js (jam simulasi + fase kantor + jumlah agen); refs
  // {lobbyCtx, lobbyTex} diekspos utk redraw per menit-sim dari OfficeScene.
  const rcScreenGlow = new THREE.Mesh(new THREE.BoxGeometry(.55, .35, .01), MB(RC_SCREEN_BG));
  rcScreenGlow.position.set(RCX - .4, 1.35, RCZ + .06); reception.add(rcScreenGlow);
  const lobbyCv = document.createElement('canvas'); lobbyCv.width = LS_W; lobbyCv.height = LS_H;
  const lobbyCtx = lobbyCv.getContext('2d');
  const lobbyTex = uiTexture(new THREE.CanvasTexture(lobbyCv)); lobbyTex.minFilter = THREE.LinearFilter;
  if (lobbyCtx) drawLobbyScreen(lobbyCtx, { minutes: null, agents: 0 }); // frame awal aman ('--:--' — dipaint ulang OfficeScene saat init); guard harness tanpa ctx
  // Wajah layar menghadap +Z ke pengunjung (menempel di wajah glow z+0.06 → 0.075)
  const lobbyScreen = new THREE.Mesh(new THREE.PlaneGeometry(.55, .35), uiMaterial(new THREE.MeshBasicMaterial({ map: lobbyTex })));
  lobbyScreen.position.set(RCX - .4, 1.35, RCZ + .12); // di depan wajah body monitor (body 6.565..6.595 — dulu 6.575 TERTANAM di dalam body)
  reception.add(lobbyScreen);

  // Keyboard + mouse
  const rcKb = new THREE.Mesh(new THREE.BoxGeometry(.3, .02, .1), M(RC_PERIPH_DARK));
  rcKb.position.set(RCX - .4, .95, RCZ + .15); reception.add(rcKb);
  const rcMouse = new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .07), M(RC_PERIPH_DARK));
  rcMouse.position.set(RCX - .1, .95, RCZ + .15); reception.add(rcMouse);

  // Reception chair (behind desk)
  const rcChairSeat = new THREE.Mesh(new THREE.BoxGeometry(.4, .04, .4), M(RC_CHAIR_SHELL));
  rcChairSeat.position.set(RCX - .4, .44, RCZ - .4); reception.add(rcChairSeat);
  const rcChairBack = new THREE.Mesh(new THREE.BoxGeometry(.4, .42, .04), M(RC_CHAIR_SHELL));
  rcChairBack.position.set(RCX - .4, .67, RCZ - .59); reception.add(rcChairBack);
  const rcPole = new THREE.Mesh(new THREE.BoxGeometry(.05, .38, .05), M(FURN_CHAIR_POLE));
  rcPole.position.set(RCX - .4, .2, RCZ - .4); reception.add(rcPole);
  const rcBase = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, .04, 10), M(FURN_CHAIR_BASE));
  rcBase.position.set(RCX - .4, .02, RCZ - .4); reception.add(rcBase);

  // RECEPTION AGENT — "NEXUS" (white/silver, the coordinator)
  const nexusAgent = { name: 'WAHYU FS', color: RC_FOUNDER_ACCENT, hex: AMBER_ACCENT, role: 'Founder / CEO', hair: RC_FOUNDER_HAIR, shirt: RC_FOUNDER_SHIRT, pants: RC_FOUNDER_PANTS };
  const nexusChar = buildChar(nexusAgent, false);
  const hMult = (looksOf ? looksOf(nexusAgent).h : 1.04) || 1.04;
  if (nexusChar.scale && nexusChar.scale.set) {
    nexusChar.scale.set(2.2, 2.2 * hMult, 2.2);
  } else if (nexusChar.scale && nexusChar.scale.setScalar) {
    nexusChar.scale.setScalar(2.2);
  }
  nexusChar.position.set(RCX - .4, .04, RCZ - .4); // behind desk
  nexusChar.rotation.y = Math.PI; // face +Z toward visitors
  reception.add(nexusChar);

  // Label Founder (plat sama seperti agent lain)
  const nxLabel = makeLabel(nexusAgent);
  nxLabel.scale.set(3.2, .8, 1); nxLabel.position.set(RCX - .4, 3.3, RCZ - .4);
  reception.add(nxLabel);

  office.add(reception);

  return { reception, rcLight, nexusChar, nxLabel, nexusAgent, rcGlow, rcScreenGlow, lobbyCtx, lobbyTex, lobbyScreen };
}
