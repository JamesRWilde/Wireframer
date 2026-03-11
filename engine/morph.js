
'use strict';

// --- Robust Morphing State Machine and API ---
let morphState = {
  active: false,
  startTime: 0,
  duration: 0,
  fromMesh: null,
  toMesh: null,
  currentMesh: null,
  progress: 0,
  onComplete: null,
};

function cloneMesh(mesh) {
  return {
    V: mesh.V.map(v => v.slice()),
    F: mesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: mesh.E.map(e => e.slice()),
    _shadingMode: mesh._shadingMode,
    _creaseAngleDeg: mesh._creaseAngleDeg,
    groups: mesh.groups ? mesh.groups.slice() : undefined,
    objects: mesh.objects ? mesh.objects.slice() : undefined,
    smoothingGroups: mesh.smoothingGroups ? mesh.smoothingGroups.slice() : undefined,
    triangleNormals: mesh.triangleNormals ? mesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: mesh.triangleUVs ? mesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}

function interpolateMeshes(fromMesh, toMesh, t) {
  const n = Math.max(fromMesh.V.length, toMesh.V.length);
  const V = [];
  for (let i = 0; i < n; i++) {
    const a = fromMesh.V[i % fromMesh.V.length];
    const b = toMesh.V[i % toMesh.V.length];
    V.push([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]);
  }
  return {
    V,
    F: toMesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: toMesh.E.map(e => e.slice()),
    _shadingMode: toMesh._shadingMode,
    _creaseAngleDeg: toMesh._creaseAngleDeg,
    groups: toMesh.groups ? toMesh.groups.slice() : undefined,
    objects: toMesh.objects ? toMesh.objects.slice() : undefined,
    smoothingGroups: toMesh.smoothingGroups ? toMesh.smoothingGroups.slice() : undefined,
    triangleNormals: toMesh.triangleNormals ? toMesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: toMesh.triangleUVs ? toMesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function startMorph(fromMesh, toMesh, durationMs, onComplete) {
  morphState.active = true;
  morphState.startTime = performance.now();
  morphState.duration = durationMs;
  morphState.fromMesh = cloneMesh(fromMesh);
  morphState.toMesh = cloneMesh(toMesh);
  morphState.currentMesh = cloneMesh(fromMesh);
  morphState.progress = 0;
  morphState.onComplete = typeof onComplete === 'function' ? onComplete : null;
}

function advanceMorphFrame() {
  if (!morphState.active) return;
  const now = performance.now();
  const tRaw = Math.min(1, (now - morphState.startTime) / morphState.duration);
  morphState.progress = tRaw;
  const t = easeInOut(tRaw);
  morphState.currentMesh = interpolateMeshes(morphState.fromMesh, morphState.toMesh, t);
  if (tRaw >= 1) {
    morphState.active = false;
    morphState.currentMesh = cloneMesh(morphState.toMesh);
    if (morphState.onComplete) morphState.onComplete();
  }
}

function getCurrentMorphMesh() {
  if (morphState.active) return morphState.currentMesh;
  return null;
}

function isMorphing() {
  return morphState.active;
}

function cancelMorph() {
  morphState.active = false;
  morphState.currentMesh = null;
}

window.morph = {
  startMorph,
  advanceMorphFrame,
  getCurrentMorphMesh,
  isMorphing,
  cancelMorph,
};
