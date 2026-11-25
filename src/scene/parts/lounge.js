// Welcome & lounge kantor WFS Project (kanan depan): karpet lounge berlapis,
// coffee table kaca+kayu + majalah & cangkir, 2 kursi santai, lampu berdiri,
// meja majalah, TV info dgn dashboard live dari /wfs-project.
// Builder berbasis konteks (THREE, office, M, MB, drawTvDashboard) — pola sama dgn cafe.js.
import { applyPollResult, nextPollDelay, POLL_SCENE_HEALTHY_MS, CONN_TICK_MS } from '../../lib/connection_spec.js'
import { fetchWithTimeout } from '../../lib/fetch_timeout.js'
import { uiTexture, uiMaterial } from './ui_colorspace.js'
import {
  LG_RUG_OUT, LG_RUG_IN, LG_TABLE_WOOD, LG_TABLE_GLASS, LG_LEG_WOOD, LG_MAG_COVER,
  LG_MUG, LG_CHAIR_SHELL, LG_CHAIR_CUSHION, LG_LAMP_POLE, LG_LAMP_SHADE, LG_LAMP_BULB,
  LG_MAG_RACK, LG_MAGS, LG_TV_FRAME,
} from '../../lib/ui_palette.js'

export function createLounge(ctx) {
  const { THREE, office, M, MB, drawTvDashboard, blobMat } = ctx;
  const lounge = new THREE.Group();
  lounge.position.y = 1.20; // Elevasi Lantai 3 (Welcome Lounge)
  // Karpet lounge (bulat-ish: dua kotak bertumpuk warna hangat)
  const lgRug = new THREE.Mesh(new THREE.BoxGeometry(3.2, .015, 3.0), M(LG_RUG_OUT, { transparent: true, opacity: .75 }));
  lgRug.position.set(9.7, .02, 7.4); lgRug.receiveShadow = true; lounge.add(lgRug);
  const lgRugIn = new THREE.Mesh(new THREE.BoxGeometry(2.4, .017, 2.2), M(LG_RUG_IN, { transparent: true, opacity: .75 }));
  lgRugIn.position.set(9.7, .025, 7.4); lounge.add(lgRugIn);
  // Coffee table (kaca + kayu) di depan sofa
  const ctB = new THREE.Mesh(new THREE.BoxGeometry(1.0, .06, .6), M(LG_TABLE_WOOD));
  ctB.position.set(9.55, .36, 6.4); lounge.add(ctB);
  if (blobMat) {
    const ctShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), blobMat);
    ctShadow.rotation.x = -Math.PI / 2;
    ctShadow.position.set(9.55, 0.012, 6.4);
    ctShadow.renderOrder = 2;
    ctShadow.userData.blob = true;
    lounge.add(ctShadow);
  }
  const ctTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, .03, .7), M(LG_TABLE_GLASS, { transparent: true, opacity: .55 }));
  ctTop.position.set(9.55, .42, 6.4); lounge.add(ctTop);
  [[-.42, -.22], [.42, -.22], [-.42, .22], [.42, .22]].forEach(([ox, oz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.05, .34, .05), M(LG_LEG_WOOD));
    leg.position.set(9.55 + ox, .17, 6.4 + oz); lounge.add(leg);
  });
  // Majalah + cangkir di coffee table
  const mag = new THREE.Mesh(new THREE.BoxGeometry(.24, .012, .3), M(LG_MAG_COVER));
  mag.position.set(9.4, .45, 6.35); mag.rotation.y = .4; lounge.add(mag);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .08, 8), M(LG_MUG));
  mug.position.set(9.75, .475, 6.5); lounge.add(mug);
  (mug.userData = mug.userData || {}).__cupBasis = .475; // siklus 516: basis Y utk cupLift (mug lounge ikut sesekali "diambil-diminum")
  // 2 kursi santai menghadap sofa/meja
  const armChair = (cx, cz, ry) => {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.6, .3, .6), M(LG_CHAIR_SHELL)); seat.position.y = .3; g.add(seat);
    const cush = new THREE.Mesh(new THREE.BoxGeometry(.52, .1, .52), M(LG_CHAIR_CUSHION)); cush.position.y = .5; g.add(cush);
    const back = new THREE.Mesh(new THREE.BoxGeometry(.6, .55, .12), M(LG_CHAIR_SHELL)); back.position.set(0, .72, -.26); g.add(back);
    [[-.26, -.26], [.26, -.26], [-.26, .26], [.26, .26]].forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.05, .15, .05), M(LG_LEG_WOOD));
      leg.position.set(ox, .075, oz); g.add(leg);
    });
    g.position.set(cx, 0, cz); g.rotation.y = ry;
    g.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.castShadow = true; });
    lounge.add(g); return g;
  };
  const chair1 = armChair(8.7, 7.7, Math.PI * .5);   // menghadap +X (ke arah sofa)
  const chair2 = armChair(9.6, 8.6, Math.PI);        // menghadap -Z (ke coffee table)
  // Lampu berdiri (pole + shade hangat) di sudut lounge
  const flPole = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, 1.5, 8), M(LG_LAMP_POLE));
  flPole.position.set(11.2, .75, 8.6); lounge.add(flPole);
  const flShade = new THREE.Mesh(new THREE.CylinderGeometry(.18, .24, .28, 10, 1, true),
    M(LG_LAMP_SHADE, { side: THREE.DoubleSide, transparent: true, opacity: .9 }));
  flShade.position.set(11.2, 1.6, 8.6); lounge.add(flShade);
  const flBulb = new THREE.PointLight(LG_LAMP_BULB, .5, 4, 2);
  flBulb.position.set(11.2, 1.5, 8.6); lounge.add(flBulb);
  // Meja majalah rendah + TV info layar (di dinding kanan area lounge)
  const magRack = new THREE.Mesh(new THREE.BoxGeometry(.5, .45, .35), M(LG_MAG_RACK));
  magRack.position.set(11.9, .225, 7.0); lounge.add(magRack);
  const mags = LG_MAGS.map((c, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(.06, .22, .28), M(c));
    b.position.set(11.72, .36, 7.0 - (i - 1) * .0); b.rotation.z = 0; lounge.add(b);
    (b.userData = b.userData || {}).__magBasis = 0; // siklus 513: basis sudut utk magTilt
    return b;
  });
  const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(.06, .75, 1.3), M(LG_TV_FRAME));
  tvFrame.position.set(12.35, 2.0, 6.4); lounge.add(tvFrame);
  // TV lounge: dashboard live dari /wfs-project (data nyata). Statis lama
  // ("uptime: 99.98%", "agents: 14 online") = angka hardcode menyesatkan → dihapus.
  // drawTv diekstrak murni ke parts/tv_canvas.js (diuji unit); di sini cukup injek ctx.
  const tvC = document.createElement('canvas'); tvC.width = 256; tvC.height = 144;
  window.__tvCanvas = tvC; // hook debug/uji: baca pixel badge koneksi via CDP (paritas __tvData)
  const tvx = tvC.getContext('2d');
  // Tekstur 3D dibuat SEBELUM drawTv pertama: drawTv kini menandai
  // tvTex.needsUpdate di SEMUA jalur gambar (sukses, gagal, detak umur).
  const tvTex = uiTexture(new THREE.CanvasTexture(tvC)); tvTex.minFilter = THREE.LinearFilter;
  // Tracker kesehatan koneksi (paritas papan 3D & chip HUD) — down sejak awal.
  let tvConn = applyPollResult(null, { ok: false, error: 'init' }, 0);
  // Badge koneksi gateway (LIVE/TERPUTUS/SINKRON N LALU) digambar di sudut kanan
  // atas TV setiap drawTv — ditarik dari tracker tvConn (state + umur data).
  // tvTex.needsUpdate WAJIB tiap gambar: drawTv juga dipanggil dari jalur gagal
  // (catch) & ticker detak umur — kanvas 2D berubah tapi tekstur 3D tidak akan
  // ikut segar bila lupa flag ini (bug siklus 109: badge TERPUTUS/SINKRON tak
  // pernah tampak di TV 3D nyata, hanya di kanvas 2D yang dibaca e2e).
  function drawTv() {
    const ageSec = tvConn.lastOkAt != null ? Math.max(0, Math.floor((Date.now() - tvConn.lastOkAt) / 1000)) : 0;
    // Siklus 529: hitungan agen on-site live dari simulasi scene (bukan gateway)
    // — offsite lunch/pulang dikecualikan (paritas lobbyOnsiteCount 528).
    let onsite = null, onsiteTotal = null;
    if (Array.isArray(window.__agentData)) {
      onsite = window.__agentData.reduce((n, a) => n + (a && typeof a === 'object' && a.state !== 'offsite' ? 1 : 0), 0);
      onsiteTotal = window.__agentData.length;
    }
    drawTvDashboard(tvx, window.__tvData, { conn: { state: tvConn.state, ageSec }, onsite, onsiteTotal });
    tvTex.needsUpdate = true;
    window.__lastTvDrawAt = Date.now();
  }
  drawTv();
  const tvScr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .68), uiMaterial(new THREE.MeshBasicMaterial({ map: tvTex })));
  async function tvPull(force = false) {
    if (!force && document.visibilityState === 'hidden') return;
    if (tvStopped) return; // destroy sudah jalan (remount/HMR) — jangan mulai siklus baru
    try {
      const r = await fetchWithTimeout('/wfs-project');
      // Siklus 125: scene bisa dimusnahkan selama fetch berjalan (remount/HMR).
      // Dulu await selesai SETELAH purge destroy → window.__tvData/__lastTvDrawAt
      // "bangkit" kembali menunjuk scene mati + drawTv() menggambar canvas mati
      // (terdeteksi probe e2e_async_destroy: intercept fetch → destroy → resolve).
      if (tvStopped) return;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if (tvStopped) return; // guard kedua: await json juga bisa kejar scene mati
      window.__tvData = { ...d, at: Date.now() };
      tvConn = applyPollResult(tvConn, { ok: true });
      drawTv();
    } catch (e) {
      if (tvStopped) return; // guard catch: error fetch tidak boleh menyentuh scene mati
      tvConn = applyPollResult(tvConn, { ok: false, error: 'offline' });
      drawTv(); // badge koneksi langsung berubah (TERPUTUS/SINKRON) tanpa menunggu tick
      window.__tvPullErr = String(e && e.stack || e);
    }
  }
  // Polling adaptif: rantai setTimeout (60 dtk sehat = POLL_SCENE_HEALTHY_MS
  // satu sumber, siklus 375 — dulu konstanta lokal TV_POLL_HEALTHY_MS, backoff
  // 5→80s saat gagal, pulih → 60 dtk) — TV tak lagi menghantam gateway mati
  // tiap 60 dtk.
  // Jadwal pertama menyusul pull awal selesai, agar delay dihitung dari tracker segar.
  const TV_POLL_HEALTHY_MS = POLL_SCENE_HEALTHY_MS;
  let tvPollTimer = null;
  let tvStopped = false;
  // Detak umur data: saat state non-live (stale/down), label "SINKRON N dtk/mnt
  // LALU" harus berdetak tiap 30 dtk — paritas papan 3D (connIv). Bila live,
  // drawTv sudah dipanggil tiap pull sukses; tick di-skip agar hemat.
  // Siklus 469: tickers repaint gerbang visibility — tab hidden tak melakukan
  // repaint sia-sia (paritas useVisibilityPoll UI): tick conn & on-site di-skip
  // saat document.visibilityState==='hidden'; tick on-site kembali melukis satu
  // kali saat tab visible lagi (pageHidden latch) agar hitungan tak basi.
  const connTick = setInterval(() => { if (document.visibilityState === 'hidden') return; if (tvConn.state !== 'live') drawTv(); }, CONN_TICK_MS);
  // Siklus 529: hitungan on-site berubah saat agen lunch/pulang (bukan saat
  // pull gateway) — ticker 5 dtk redraw hanya bila angka berubah (hemat).
  let __onsiteLast = null;
  let __onsitePageHidden = document.visibilityState === 'hidden';
  const onsiteTick = setInterval(() => {
    const hidden = document.visibilityState === 'hidden';
    if (hidden) { __onsitePageHidden = true; return; }
    if (!Array.isArray(window.__agentData)) return;
    const n = window.__agentData.reduce((s, a) => s + (a && typeof a === 'object' && a.state !== 'offsite' ? 1 : 0), 0);
    if (n !== __onsiteLast || __onsitePageHidden) { __onsiteLast = n; __onsitePageHidden = false; drawTv(); }
  }, 5000);
  function tvSchedule() {
    tvPollTimer = setTimeout(async () => {
      await tvPull();
      if (!tvStopped) tvSchedule();
    }, nextPollDelay(tvConn, TV_POLL_HEALTHY_MS));
  }
  tvPull(true).then(() => { if (!tvStopped) tvSchedule(); });
  const tvOnVis = () => { if (document.visibilityState === 'visible') tvPull() };
  document.addEventListener('visibilitychange', tvOnVis);
  function tvDestroy() {
    tvStopped = true; // hentikan rantai poll adaptif
    if (tvPollTimer !== null) clearTimeout(tvPollTimer);
    clearInterval(connTick); // detak umur badge ikut berhenti
    clearInterval(onsiteTick); // siklus 529: ticker on-site ikut berhenti
    document.removeEventListener('visibilitychange', tvOnVis);
  }
  tvScr.position.set(12.31, 2.0, 6.4); tvScr.rotation.y = -Math.PI / 2; lounge.add(tvScr);
  office.add(lounge);
  return {
    lounge, rug: lgRug, rugInner: lgRugIn, coffeeBase: ctB, coffeeTop: ctTop, magazine: mag, mug,
    chairs: [chair1, chair2], lampPole: flPole, lampShade: flShade, lampBulb: flBulb,
    magRack, mags, tvFrame, tvScreen: tvScr, tvTex, tvCanvas: tvC, tvPull, tvIv: tvPollTimer, tvSchedule, tvDestroy, tvOnVis, connTick,
  };
}
