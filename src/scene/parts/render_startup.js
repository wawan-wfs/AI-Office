// Capability hints are optional: unavailable information is not proof of a slow GPU.
// Siklus 441 — frustum bayangan matahari satu sumber: kampus 34×27 m (setengah
// 17×13,5) + elevasi matahari (14,24,12) menuntut cakupan lebih besar dari ±22;
// dulu bayangan di tepi kampus & pucuk high-rise bisa terpotong (clipping).
export const SHADOW_EXTENT = 28; // setengah-lebar ortho frustum bayangan (m)

export function applySunShadowConfig(sun) {
  if (!sun || !sun.shadow) return sun;
  sun.shadow.camera.left = -SHADOW_EXTENT;
  sun.shadow.camera.right = SHADOW_EXTENT;
  sun.shadow.camera.top = SHADOW_EXTENT;
  sun.shadow.camera.bottom = -SHADOW_EXTENT;
  sun.shadow.camera.updateProjectionMatrix();
  return sun;
}

export function startupQuality({ renderer = '', cores, memory, devicePixelRatio = 1 } = {}) {
  const low = /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(renderer)
    || (cores > 0 && cores <= 2) || (memory > 0 && memory <= 2);
  return { low, pixelRatio: low ? 0.75 : Math.min(devicePixelRatio || 1, 1.5), shadows: !low };
}

// Preserve object identities and intensities used by day-cycle/neon/debug hooks.
// Three excludes invisible lights from shader light arrays; intensity=0 alone does not.
export function applyLightBudget(scene, budget) {
  let count = 0;
  scene.traverse(object => {
    if (object.isPointLight) object.visible = count++ < budget;
  });
}
