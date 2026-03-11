      // Utility: Compute vertical center and half-depth for mesh geometry
      function computeFrameParams(vertices) {
        if (!Array.isArray(vertices) || vertices.length === 0) {
          return { cy: 0, zHalf: 1 };
        }
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        let maxD2 = 0;
        for (const v of vertices) {
          if (v[1] < minY) minY = v[1];
          if (v[1] > maxY) maxY = v[1];
          if (v[2] < minZ) minZ = v[2];
          if (v[2] > maxZ) maxZ = v[2];
          const d2 = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
          if (d2 > maxD2) maxD2 = d2;
        }
        const cy = (minY + maxY) * 0.5;
        const zHalf = Math.sqrt(maxD2) * 1.05;
        return { cy, zHalf };
      }
      // ...existing code...
    // ...existing code...
  // ...existing code...

// LOD is now handled by engine/lod.js
// Provide buildEdgesFromFacesRuntime globally for LOD decimator
window.buildEdgesFromFacesRuntime = buildEdgesFromFacesRuntime;

// Decimate mesh to a specific vertex count (architectural fix)
function decimateMeshVerticesToCount(model, targetCount) {
  if (!model || !model.V || model.V.length < 3) return model;
  const n = model.V.length;
  if (targetCount >= n) return model;
  // EDGE COLLAPSE decimator: iteratively collapse shortest edges
  let V = model.V.map(v => v.slice());
  let F = model.F.map(f => f.slice());
  let E = buildEdgesFromFacesRuntime(F);
  let valid = new Array(V.length).fill(true);
  while (V.filter((_,i)=>valid[i]).length > targetCount && E.length > 0) {
    let minLen = Infinity, minEdge = null;
    for (const [a, b] of E) {
      if (!valid[a] || !valid[b] || a === b) continue;
      const v0 = V[a], v1 = V[b];
      const len = Math.sqrt((v0[0]-v1[0])**2 + (v0[1]-v1[1])**2 + (v0[2]-v1[2])**2);
      if (len < minLen) {
        minLen = len;
        minEdge = [a, b];
      }
    }
    if (!minEdge) break;
    const [a, b] = minEdge;
    V[a] = [(V[a][0]+V[b][0])/2, (V[a][1]+V[b][1])/2, (V[a][2]+V[b][2])/2];
    valid[b] = false;
    for (let i = 0; i < F.length; ++i) {
      F[i] = F[i].map(idx => idx === b ? a : idx);
    }
    F = F.filter(face => {
      const s = new Set(face);
      return s.size === face.length && [...s].every(idx => valid[idx]);
    });
    E = buildEdgesFromFacesRuntime(F);
  }
  // Reindex vertices to remove invalids
  const oldToNew = [];
  const newVerts = [];
  for (let i = 0; i < V.length; ++i) {
    if (valid[i]) {
      oldToNew[i] = newVerts.length;
      newVerts.push(V[i]);
    }
  }
  let newFaces = F.map(face => face.map(idx => oldToNew[idx]));
  newFaces = newFaces.filter(face => (new Set(face)).size === face.length);
  const newEdges = buildEdgesFromFacesRuntime(newFaces);
  if (!newFaces.length || !newVerts.length) {
    console.warn('Edge collapse decimation produced empty mesh! Returning original.');
    return model;
  }

  return {
    ...model,
    V: newVerts,
    F: newFaces,
    E: newEdges,
  };
}

'use strict';

// (No longer needed: morph state is managed in engine/morph.js)

// Global minimum LOD percent (prevents decimation from removing all detail)
// (declared in globalVars.js)

// Cached base mesh (hull-wrapped from point cloud)
// (declared in globalVars.js)

// ─────────────── Engine/Morphing Configuration ───────────────
// Maximum number of points used for morphing (sampling cap)
// (declared in globalVars.js)
// Duration of morph animation in milliseconds
// (declared in globalVars.js)

/* ─────────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────────── */
canvas = document.getElementById('c');
if (typeof attachInputListeners === 'function') attachInputListeners(canvas);
bgCanvas = document.getElementById('bg');
fgCanvas = document.getElementById('fg');
ctx    = canvas.getContext('2d', { alpha: true, desynchronized: true });
ctx.imageSmoothingEnabled = false;
fillLayerCanvas = document.createElement('canvas');
fillLayerCtx = fillLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
fillLayerCtx.imageSmoothingEnabled = false;
W = 0; H = 0;
// (BG_PARTICLES declared in globalVars.js)
BG_PARTICLE_DENSITY = 1;
BG_PARTICLE_DENSITY_TARGET = 1;
BG_PARTICLE_VELOCITY = 1;
BG_PARTICLE_VELOCITY_TARGET = 1;
BG_PARTICLE_OPACITY = 1;
BG_PARTICLE_OPACITY_TARGET = 1;

function clampBackgroundScale(level) {
  return Math.max(0, Math.min(5.2, Number(level) || 0));
}

function createBackgroundParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    size: 0.9 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.24,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.5,
    alphaBase: 0.12 + Math.random() * 0.16,
  };
}

function getBackgroundParticleTargetCount() {
  const baseCount = Math.max(210, Math.round((W * H) / 9500));
  return Math.max(0, Math.round(baseCount * BG_PARTICLE_DENSITY_TARGET));
}

function reconcileBackgroundParticles() {
  const targetCount = getBackgroundParticleTargetCount();
  const currentCount = BG_PARTICLES.length;
  if (targetCount === currentCount) return;

  const delta = targetCount - currentCount;
  const step = Math.max(1, Math.ceil(Math.abs(delta) * 0.12));
  const amount = Math.min(Math.abs(delta), step);

  if (delta > 0) {
    for (let i = 0; i < amount; i++) BG_PARTICLES.push(createBackgroundParticle());
  } else {
    BG_PARTICLES.splice(Math.max(0, BG_PARTICLES.length - amount), amount);
  }
}


function setBackgroundParticleDensity(level) {
  BG_PARTICLE_DENSITY_TARGET = clampBackgroundScale(level);
}
window.setBackgroundParticleDensity = setBackgroundParticleDensity;

function setBackgroundParticleVelocity(level) {
  BG_PARTICLE_VELOCITY_TARGET = clampBackgroundScale(level);
}
window.setBackgroundParticleVelocity = setBackgroundParticleVelocity;

function setBackgroundParticleOpacity(level) {
  BG_PARTICLE_OPACITY_TARGET = clampBackgroundScale(level);
}
window.setBackgroundParticleOpacity = setBackgroundParticleOpacity;

function initBackgroundParticles() {
  if (!W || !H) return;

  BG_PARTICLE_DENSITY = BG_PARTICLE_DENSITY_TARGET;
  BG_PARTICLE_VELOCITY = BG_PARTICLE_VELOCITY_TARGET;
  BG_PARTICLE_OPACITY = BG_PARTICLE_OPACITY_TARGET;
  const count = getBackgroundParticleTargetCount();
  BG_PARTICLES.length = 0;

  for (let i = 0; i < count; i++) {
    BG_PARTICLES.push(createBackgroundParticle());
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (bgCanvas) {
    bgCanvas.width = W;
    bgCanvas.height = H;
  }
  if (fgCanvas) {
    fgCanvas.width = W;
    fgCanvas.height = H;
  }
  fillLayerCanvas.width = W;
  fillLayerCanvas.height = H;
  initBackgroundParticles();
}
resize();
window.addEventListener('resize', resize);

/* ─────────────────────────────────────────────────────────────────────────
   Perspective projection
   Camera sits at z = -3 (d = p[2] + 3), so negative-z is nearest.
   MODEL_CY centres the object vertically on screen.
───────────────────────────────────────────────────────────────────────── */
// (Z_HALF, ZOOM, RENDER_FRAME_ID, ZOOM_MIN, ZOOM_MAX declared in globalVars.js)

function project(p) {
  const fov = Math.min(W, H) * 0.90 * ZOOM;
  const d   = p[2] + 3.0;
  return [
    W * 0.5 + p[0] * fov / d,
    H * 0.5 - (p[1] - MODEL_CY) * fov / d,
  ];
}

function getModelFrameData(model) {
  if (!model || !model.V || !model.V.length) return null;
  if (model._frameData && model._frameData.id === RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  let T = model._cacheT;
  let P2 = model._cacheP2;
  if (!T || T.length !== V.length || !P2 || P2.length !== V.length) {
    T = new Array(V.length);
    P2 = new Array(V.length);
    for (let i = 0; i < V.length; i++) {
      T[i] = [0, 0, 0];
      P2[i] = [0, 0];
    }
    model._cacheT = T;
    model._cacheP2 = P2;
  }

  const r00 = R[0], r01 = R[1], r02 = R[2];
  const r10 = R[3], r11 = R[4], r12 = R[5];
  const r20 = R[6], r21 = R[7], r22 = R[8];
  const fov = Math.min(W, H) * 0.90 * ZOOM;
  const hw = W * 0.5;
  const hh = H * 0.5;

  for (let i = 0; i < V.length; i++) {
    const v = V[i];
    const tx = r00 * v[0] + r01 * v[1] + r02 * v[2];
    const ty = r10 * v[0] + r11 * v[1] + r12 * v[2];
    const tz = r20 * v[0] + r21 * v[1] + r22 * v[2];
    const t = T[i];
    t[0] = tx;
    t[1] = ty;
    t[2] = tz;

    const d = tz + 3.0;
    const p = P2[i];
    p[0] = hw + tx * fov / d;
    p[1] = hh - (ty - MODEL_CY) * fov / d;
  }

  model._frameData = { id: RENDER_FRAME_ID, T, P2 };
  return model._frameData;
}

/* ─────────────────────────────────────────────────────────────────────────
   ENGINE-FIRST, GROUND-UP 3D ENGINE CORE
───────────────────────────────────────────────────────────────────────── */
// The engine accepts only point clouds as input, generates its own mesh, and owns all further processing.
// (MODEL, MODEL_CY declared in globalVars.js)
MODEL = { V: [], F: [], E: [] };
window.DETAIL_LEVEL = 1;
MODEL_CY = 0;


// Entry: Accept OBJ-style mesh { V: [[x,y,z]...], F: [[i,j,k]...] }, set as active model

function loadMesh(mesh, name = 'Shape', options = {}) {
  const {
    animateMorph = false,
    detailPercent = 1,
  } = options || {};
  console.log(`[loadMesh] Incoming mesh for ${name}: type=${typeof mesh}`);
  if (mesh === undefined || mesh === null) {
    throw new Error(`[loadMesh] Mesh input is ${mesh === null ? 'null' : 'undefined'} for '${name}'.\n  - Source: build function or mesh file did not return a valid OBJ string.\n  - Check loader.js and meshes/${name.toLowerCase()}.mesh.js for correct export and build function.`);
  }
  if (typeof mesh === 'string') {
    console.log(`[loadMesh] Parsing OBJ string length=${mesh.length}`);
    const meshFileName = options.meshFileName || `${name.toLowerCase()}.mesh.js`;
    const meshType = options.meshType || 'OBJ';
    mesh = toRuntimeMesh(mesh, { meshFileName, meshType });
    console.log(`[loadMesh] After toRuntimeMesh: V=${mesh?.V?.length || 0}, F=${mesh?.F?.length || 0}`);
  }
  console.log(`[loadMesh] Parsed mesh counts: V=${mesh?.V?.length || 0}, F=${mesh?.F?.length || 0}`);
  // Remove all explicit mesh load failure error messages and throws. Let engine fail naturally.
  if (!Array.isArray(mesh.V) || mesh.V.length < 3) {
    throw new Error(`[loadMesh] Mesh must have at least 3 vertices.\n  - mesh.V: ${mesh.V ? mesh.V.length : 'missing'}\n  - Mesh file: ${options.meshFileName || name}\n  - Mesh type: ${options.meshType || 'OBJ'}`);
  }
  if (!Array.isArray(mesh.F) || mesh.F.length < 1) {
    throw new Error(`[loadMesh] Mesh must have at least 1 face.\n  - mesh.F: ${mesh.F ? mesh.F.length : 'missing'}\n  - Mesh file: ${options.meshFileName || name}\n  - Mesh type: ${options.meshType || 'OBJ'}`);
  }
  console.log(`[loadMesh] Input: V=${mesh.V.length}, F=${mesh.F.length}`);

  const V = mesh.V;
  const F = mesh.F;
  const E = buildEdgesFromFacesRuntime(F);

  const newModel = {
    V,
    F,
    E: filterValidEdges(E, V),
    _meshFormat: 'obj-style',
    _shadingMode: 'auto',
    _creaseAngleDeg: undefined,
  };

  // Set LOD range
  LOD_RANGE = { min: window.LODManager.MIN_VERTS, max: newModel.V.length };
  // Set LOD to requested detail percent (default full detail)
  const clampedDetail = Math.max(0, Math.min(1, Number(detailPercent) || 1));
  // If morphing, trigger morph from current MODEL to newModel
  if (animateMorph && typeof window.morph === 'object' && window.morph.startMorph) {
    window.morph.startMorph(MODEL, newModel, 1600, () => setActiveModel(newModel, name));
  } else {
    BASE_MODEL = newModel;
    setDetailLevel(clampedDetail, name);
  }
}
window.loadMesh = loadMesh;

// Set LOD by percent (0..1), update mesh and HUD
function setDetailLevel(percent, name = 'Shape') {
  if (!BASE_MODEL) return;
  const clampedPercent = Math.max(0, Math.min(1, percent));
  CURRENT_LOD_VERTS = Math.round(clampedPercent * BASE_MODEL.V.length);
  // QEM receives percentage, calculates target itself
  CURRENT_LOD_MODEL = window.LODManager.decimateMeshByPercent(BASE_MODEL, clampedPercent);
  setActiveModel(CURRENT_LOD_MODEL, name);
}
window.setDetailLevel = setDetailLevel;

// Expose LOD range for UI
function getLodRange() {
  return LOD_RANGE;
}
window.getLodRange = getLodRange;

// Expose current LOD vertex count for UI
function getCurrentLodVerts() {
  return CURRENT_LOD_VERTS || (BASE_MODEL ? BASE_MODEL.V.length : 0);
}
window.getCurrentLodVerts = getCurrentLodVerts;

function setGlobalMinLodPercent(percent) {
  GLOBAL_MIN_LOD_PERCENT = Math.max(1, Math.min(100, Number(percent) || 5));
}

// Minimal, robust QEM decimation that always reduces vertex count
function decimateMeshVertices(model, percent) {
  if (!model || !model.V || model.V.length < 3) return model;
  const n = model.V.length;
  const minPercent = Math.max(GLOBAL_MIN_LOD_PERCENT, 1);
  const clampedPercent = Math.max(minPercent, Math.min(100, percent));
  const targetCount = Math.max(3, Math.round((clampedPercent / 100) * n));
  if (targetCount >= n) return model;

  // EDGE COLLAPSE decimator: iteratively collapse shortest edges
  let V = model.V.map(v => v.slice());
  let F = model.F.map(f => f.slice());
  if (V.length <= targetCount) return model;

  // Helper: compute edge lengths
  function edgeLength(a, b) {
    const v0 = V[a], v1 = V[b];
    return Math.sqrt((v0[0]-v1[0])**2 + (v0[1]-v1[1])**2 + (v0[2]-v1[2])**2);
  }

  // Build initial edge list
  let E = buildEdgesFromFacesRuntime(F);

  // Track which vertices are still valid
  let valid = new Array(V.length).fill(true);

  // Collapse edges until targetCount is reached
  while (V.filter((_,i)=>valid[i]).length > targetCount && E.length > 0) {
    // Find shortest valid edge
    let minLen = Infinity, minEdge = null;
    for (const [a, b] of E) {
      if (!valid[a] || !valid[b] || a === b) continue;
      const len = edgeLength(a, b);
      if (len < minLen) {
        minLen = len;
        minEdge = [a, b];
      }
    }
    if (!minEdge) break;
    const [a, b] = minEdge;
    // Collapse b into a (move a to midpoint)
    V[a] = [(V[a][0]+V[b][0])/2, (V[a][1]+V[b][1])/2, (V[a][2]+V[b][2])/2];
    valid[b] = false;
    // Remap faces: replace b with a
    for (let i = 0; i < F.length; ++i) {
      F[i] = F[i].map(idx => idx === b ? a : idx);
    }
    // Remove degenerate faces (collapsed to line or point)
    F = F.filter(face => {
      const s = new Set(face);
      return s.size === face.length && [...s].every(idx => valid[idx]);
    });
    // Rebuild edge list
    E = buildEdgesFromFacesRuntime(F);
  }
  // Reindex vertices to remove invalids
  const oldToNew = [];
  const newVerts = [];
  for (let i = 0; i < V.length; ++i) {
    if (valid[i]) {
      oldToNew[i] = newVerts.length;
      newVerts.push(V[i]);
    }
  }
  let newFaces = F.map(face => face.map(idx => oldToNew[idx]));
  // Remove any degenerate faces again
  newFaces = newFaces.filter(face => (new Set(face)).size === face.length);
  const newEdges = buildEdgesFromFacesRuntime(newFaces);
  if (!newFaces.length || !newVerts.length) {
    console.warn('Edge collapse decimation produced empty mesh! Returning original.');
    return model;
  }
  return {
    ...model,
    V: newVerts,
    F: newFaces,
    E: newEdges,
  };
}

const MODEL_CACHE = new Map();
const MODEL_CACHE_LIMIT = 80;


function updateHud(name, vertexCount, edgeCount, cy, zHalf) {
  // Update HUD telemetry for vertex and edge counts
  if (typeof statV !== 'undefined' && statV && typeof statV.textContent !== 'undefined') {
    statV.textContent = vertexCount != null ? vertexCount : '--';
  }
  if (typeof statE !== 'undefined' && statE && typeof statE.textContent !== 'undefined') {
    statE.textContent = edgeCount != null ? edgeCount : '--';
  }
  // cy and zHalf are now passed in for HUD updates
  return { cy, zHalf };
}

function setActiveModel(model, name) {
  MODEL = model;
  if (MODEL === BASE_MODEL) {
    // Defensive: ensure BASE_MODEL is never mutated
    if (Object.isFrozen && !Object.isFrozen(BASE_MODEL)) {
      console.warn('[setActiveModel] BASE_MODEL is not frozen!');
    }
  }
  const params = computeFrameParams(MODEL.V);
  MODEL_CY = params.cy;
  Z_HALF = params.zHalf;
  console.log(`[setActiveModel] MODEL.V.length=${MODEL.V.length}, MODEL.E.length=${MODEL.E.length}`);
  updateHud(name, MODEL.V.length, MODEL.E.length, params.cy, params.zHalf);
}

// Expose to global scope for UI/LOD integration
window.setActiveModel = setActiveModel;

function currentLodBucket() {
  return Math.round(DETAIL_LEVEL * 100);
}

function buildEdgesFromFacesRuntime(faces) {
  const E = [];
  const edgeSet = new Set();

  function addEdge(a, b) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}|${hi}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    E.push([lo, hi]);
  }

  for (const face of faces || []) {
    const indices = face && face.indices ? face.indices : face;
    if (!Array.isArray(indices) || indices.length < 2) continue;
    for (let i = 0; i < indices.length; i++) {
      addEdge(indices[i], indices[(i + 1) % indices.length]);
    }
  }

  return E;
}

// Utility: filter edges to only those with valid vertex indices (engine schema only)
function filterValidEdges(E, V) {
  const n = V.length;
  return (E || []).filter(e =>
    Array.isArray(e) && e.length === 2 &&
    Number.isInteger(e[0]) && Number.isInteger(e[1]) &&
    e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1]
  );
}

function toRuntimeMesh(rawObjText, overrides = {}) {
  if (rawObjText === undefined || rawObjText === null) {
    console.error('[toRuntimeMesh] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[toRuntimeMesh] Input mesh is undefined/null');
  }
  if (typeof rawObjText !== 'string') {
    console.error('[toRuntimeMesh] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof rawObjText });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  // Log mesh input for diagnostics
  console.log(`[toRuntimeMesh] mesh input:`, rawObjText && typeof rawObjText === 'string' ? rawObjText.slice(0, 200) + '...' : rawObjText);
  const parseStart = Date.now();
  const lines = rawObjText.split(/\r?\n/);
  // Validate after splitting lines
  if (!Array.isArray(lines) || lines.length === 0) {
    console.error('[toRuntimeMesh] OBJ lines array is invalid or empty.', lines);
    throw new Error('[toRuntimeMesh] OBJ lines array is invalid or empty');
  }
  let lineNumber = 0;
  const vertices = [];
  const normals = [];
  const uvs = [];
  // OBJ can have multiple unique (v,vt,vn) per logical vertex, so we need to build a unique vertex list for each combination
  const uniqueVerts = [];
  const vertMap = new Map(); // key: v/vt/vn string, value: index in uniqueVerts
  const faces = [];
  let currentGroup = null;
  let currentObject = null;
  let currentSmoothing = null;
  const failingLines = [];
  for (const line of lines) {
    lineNumber++;
    if (!line || line.startsWith('#')) continue;
    try {
      const parts = line.trim().split(/\s+/);
      const prefix = parts[0];
      if (prefix === 'v') {
        if (parts.length < 4) {
          failingLines.push(`[${lineNumber}] Invalid vertex (too few fields): '${line}'`);
          continue;
        }
        const vx = Number(parts[1]);
        const vy = Number(parts[2]);
        const vz = Number(parts[3]);
        if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vz)) {
          failingLines.push(`[${lineNumber}] Invalid vertex (non-numeric): '${line}'`);
          continue;
        }
        vertices.push([vx, vy, vz]);
      } else if (prefix === 'vn') {
        if (parts.length < 4) continue;
        const nx = Number(parts[1]);
        const ny = Number(parts[2]);
        const nz = Number(parts[3]);
        if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) continue;
        normals.push([nx, ny, nz]);
      } else if (prefix === 'vt') {
        if (parts.length < 3) continue;
        const u = Number(parts[1]);
        const v = Number(parts[2]);
        if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
        uvs.push([u, v]);
      } else if (prefix === 'f') {
        // Parse faces with v, v/vt, v//vn, v/vt/vn, and negative indices
        const rawTokens = parts.slice(1);
        if (rawTokens.length < 3) {
          failingLines.push(`[${lineNumber}] Malformed face (too few indices): '${line}'`);
          continue;
        }
        // Parse each face vertex, extracting all indices
        const faceVerts = [];
        for (const token of rawTokens) {
          // token: v, v/vt, v//vn, v/vt/vn
          const fields = token.split('/');
          // Vertex index
          let vIdx = Number(fields[0]);
          if (!Number.isFinite(vIdx) || vIdx === 0) {
            faceVerts.push({v: -1, vt: null, vn: null});
            continue;
          }
          if (vIdx > 0) {
            vIdx = vIdx - 1;
          } else if (vIdx < 0) {
            vIdx = vertices.length + vIdx;
          }
          // Texture index
          let vtIdx = null;
          if (fields.length > 1 && fields[1] !== '') {
            vtIdx = Number(fields[1]);
            if (Number.isFinite(vtIdx)) {
              vtIdx = vtIdx > 0 ? vtIdx - 1 : uvs.length + vtIdx;
            } else {
              vtIdx = null;
            }
          }
          // Normal index
          let vnIdx = null;
          if (fields.length > 2 && fields[2] !== '') {
            vnIdx = Number(fields[2]);
            if (Number.isFinite(vnIdx)) {
              vnIdx = vnIdx > 0 ? vnIdx - 1 : normals.length + vnIdx;
            } else {
              vnIdx = null;
            }
          }
          faceVerts.push({v: vIdx, vt: vtIdx, vn: vnIdx});
        }
        // Check for out-of-bounds
        const outOfBounds = faceVerts.filter(idx => idx.v < 0 || idx.v >= vertices.length);
        if (outOfBounds.length > 0) {
          failingLines.push(`[${lineNumber}] Out-of-bounds face indices: '${line}' | Invalid indices: ${outOfBounds.map(x=>x.v).join(', ')}`);
          continue;
        }
        function getOrCreateVertIdx(v, vt, vn) {
          const key = `${v}/${vt !== null ? vt : ''}/${vn !== null ? vn : ''}`;
          if (vertMap.has(key)) return vertMap.get(key);
          const pos = vertices[v] || [0,0,0];
          const uv = (vt !== null && uvs[vt]) ? uvs[vt] : [0,0];
          const norm = (vn !== null && normals[vn]) ? normals[vn] : [0,0,0];
          const fullVert = [pos[0], pos[1], pos[2], uv[0], uv[1], norm[0], norm[1], norm[2]];
          const idx = uniqueVerts.length;
          uniqueVerts.push(fullVert);
          vertMap.set(key, idx);
          return idx;
        }
        for (let i = 1; i < faceVerts.length - 1; i++) {
          const tri = [
            getOrCreateVertIdx(faceVerts[0].v, faceVerts[0].vt, faceVerts[0].vn),
            getOrCreateVertIdx(faceVerts[i].v, faceVerts[i].vt, faceVerts[i].vn),
            getOrCreateVertIdx(faceVerts[i+1].v, faceVerts[i+1].vt, faceVerts[i+1].vn)
          ];
          if ((new Set(tri)).size === 3) {
            faces.push({
              indices: tri,
              group: currentGroup,
              object: currentObject,
              smoothing: currentSmoothing
            });
          }
        }
      } else if (prefix === 'g') {
        // Group line
        currentGroup = parts.length > 1 ? parts.slice(1).join(' ') : null;
        continue;
      } else if (prefix === 'o') {
        // Object line
        currentObject = parts.length > 1 ? parts.slice(1).join(' ') : null;
        continue;
      } else if (prefix === 's') {
        // Smoothing group line
        currentSmoothing = parts.length > 1 ? parts[1] : null;
        continue;
      } else if (
        prefix === 'mtllib' ||
        prefix === 'usemtl'
      ) {
        // Ignore material/texture assignment lines
        continue;
      } else {
        // Only log actual parsing failures, not unsupported but valid lines
        continue;
      }
    } catch (err) {
      const fileName = overrides.meshFileName || 'unknown';
      failingLines.push(`[${lineNumber}] Exception parsing line in OBJ file '${fileName}': '${line}' | Error: ${err && err.message ? err.message : err}`);
      console.error(`[toRuntimeMesh] Exception at line ${lineNumber} in OBJ file '${fileName}':`, line, err);
      continue;
    }
  }
  window.lastMeshParseErrors = failingLines;
  console.log(`[toRuntimeMesh] parse complete: uniqueVerts=${uniqueVerts.length}, F=${faces.length}, errors=${failingLines.length}, duration=${Date.now()-parseStart}ms`);
  if (uniqueVerts.length === 0 || faces.length === 0 || failingLines.length > 0) {
    console.error('[toRuntimeMesh] Mesh load failure:', {
      meshFile: overrides.meshFileName || 'unknown',
      meshType: overrides.meshType || 'OBJ',
      vertices: uniqueVerts.length,
      faces: faces.length,
      errors: failingLines.slice(0, 10),
      errorCount: failingLines.length
    });
    throw new Error('[toRuntimeMesh] Mesh load failure');
  }
  // Validate before returning mesh object
  // F: array of { indices: [a,b,c], group, object, smoothing }
  // F: array of { indices: [a,b,c], group, object, smoothing }
  const meshObj = {
    V: uniqueVerts, // [x, y, z, u, v, nx, ny, nz]
    F: faces, // { indices: [a,b,c], group, object, smoothing }
    groups: Array.from(new Set(faces.map(f => f.group).filter(Boolean))),
    objects: Array.from(new Set(faces.map(f => f.object).filter(Boolean))),
    smoothingGroups: Array.from(new Set(faces.map(f => f.smoothing).filter(Boolean)))
  };
  meshObj.E = buildEdgesFromFacesRuntime(faces.map(f => f.indices));
  meshObj.triangles = faces.map(f => f.indices);
  meshObj.triangleGroups = faces.map(f => f.group);
  meshObj.triangleObjects = faces.map(f => f.object);
  meshObj.triangleSmoothing = faces.map(f => f.smoothing);
  // Expose per-corner normals and UVs for renderer
  meshObj.triangleNormals = faces.map(f => f.indices.map(i => [uniqueVerts[i][5], uniqueVerts[i][6], uniqueVerts[i][7]]));
  meshObj.triangleUVs = faces.map(f => f.indices.map(i => [uniqueVerts[i][3], uniqueVerts[i][4]]));
  if (meshObj === undefined || meshObj === null) {
    console.error('[toRuntimeMesh] Returned mesh object is undefined/null.', meshObj);
    throw new Error('[toRuntimeMesh] Returned mesh object is undefined/null');
  }
  if (!Array.isArray(meshObj.V) || !Array.isArray(meshObj.F)) {
    console.error('[toRuntimeMesh] Returned mesh object V or F is not an array.', meshObj);
    throw new Error('[toRuntimeMesh] Returned mesh object V or F is not an array');
  }
  return meshObj;
}

function loadObject(obj) {
  MORPH = null;
  const model = getDetailModel(obj);
  console.log(`[loadObject] model.V.length=${model.V.length}, model.E.length=${model.E.length}`);
  setActiveModel(model, obj.name);
}

function sortVerticesForMorph(vertices) {
  return vertices
    .map((v) => [v[0], v[1], v[2]])
    .sort(compareMorphVertices);
}

function compareMorphVertices(a, b) {
  if (Math.abs(a[1] - b[1]) > 0.03) return a[1] - b[1];
  const aa = Math.atan2(a[2], a[0]);
  const ab = Math.atan2(b[2], b[0]);
  if (aa !== ab) return aa - ab;
  const ra = a[0] * a[0] + a[2] * a[2];
  const rb = b[0] * b[0] + b[2] * b[2];
  return ra - rb;
}

function mapVerticesToTargetOrder(sourceVertices, targetVertices) {
  // Fast nearest-neighbor mapping with random sampling and hard cap for performance
  const nSource = sourceVertices.length;
  const nTarget = targetVertices.length;
  if (!nSource) return targetVertices.map((v) => [v[0], v[1], v[2]]);

  // Cap the number of points for morph mapping
  const MAX_MORPH_POINTS = 300;
  const sampleCount = Math.min(MAX_MORPH_POINTS, nSource, nTarget);

  // Randomly sample points from source and target for even coverage
  function randomSample(arr, count) {
    const n = arr.length;
    if (count >= n) return arr.slice();
    const result = [];
    const used = new Set();
    while (result.length < count) {
      const idx = Math.floor(Math.random() * n);
      if (!used.has(idx)) {
        used.add(idx);
        result.push(arr[idx]);
      }
    }
    return result;
  }

  const sourceSample = randomSample(sourceVertices, sampleCount);
  const targetSample = randomSample(targetVertices, sampleCount);

  // Normalize for fair distance
  function getBounds(vertices) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const [x, y, z] of vertices) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    return {
      minX, minY, minZ,
      sx: Math.max(1e-6, maxX - minX),
      sy: Math.max(1e-6, maxY - minY),
      sz: Math.max(1e-6, maxZ - minZ),
    };
  }
  function normalizePoint(v, b) {
    return [
      (v[0] - b.minX) / b.sx,
      (v[1] - b.minY) / b.sy,
      (v[2] - b.minZ) / b.sz,
    ];
  }
  const sourceBounds = getBounds(sourceSample);
  const targetBounds = getBounds(targetSample);
  const sourceNorm = sourceSample.map((v) => normalizePoint(v, sourceBounds));
  const targetNorm = targetSample.map((v) => normalizePoint(v, targetBounds));

  // Greedy nearest-neighbor assignment
  const used = new Array(sourceNorm.length).fill(false);
  const mapped = new Array(targetNorm.length);
  for (let j = 0; j < targetNorm.length; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sourceNorm.length; i++) {
      if (used[i]) continue;
      const dx = sourceNorm[i][0] - targetNorm[j][0];
      const dy = sourceNorm[i][1] - targetNorm[j][1];
      const dz = sourceNorm[i][2] - targetNorm[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    used[bestIdx] = true;
    mapped[j] = [sourceSample[bestIdx][0], sourceSample[bestIdx][1], sourceSample[bestIdx][2]];
  }

  // For the full targetVertices array, assign each to the nearest in the mapped sample
  const mappedFull = new Array(nTarget);
  for (let j = 0; j < nTarget; j++) {
    // Nearest neighbor assignment
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < mapped.length; i++) {
      const dx = mapped[i][0] - targetVertices[j][0];
      const dy = mapped[i][1] - targetVertices[j][1];
      const dz = mapped[i][2] - targetVertices[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    mappedFull[j] = mapped[bestIdx];
  }
  return mappedFull;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getMorphNowVertices(nowMs) {
  if (!MORPH || !MORPH.active) return [];
  const tRaw = Math.max(0, Math.min(1, (nowMs - MORPH.startMs) / MORPH.durationMs));
  const t = easeInOutCubic(tRaw);
  const V = new Array(MORPH.sampleCount);
  for (let i = 0; i < MORPH.sampleCount; i++) {
    const a = MORPH.fromPts[i];
    const b = MORPH.toPts[i];
    V[i] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  return V;
}

function startMorphToObject(obj, nowMs = performance.now()) {
  // Morph to the current LOD mesh (never re-hull)
  const toModel = getDetailModel();
  const fromModel = MORPH && MORPH.active ? { V: getMorphNowVertices(nowMs), E: [] } : MODEL;

  if (toModel === BASE_MODEL && Object.isFrozen && !Object.isFrozen(BASE_MODEL)) {
    console.warn('[startMorphToObject] BASE_MODEL is not frozen!');
  }

  const meshFromPts = mapVerticesToTargetOrder(fromModel.V, toModel.V);
  const meshModel = {
    V: meshFromPts.map((v) => [v[0], v[1], v[2]]),
    E: toModel.E,
    F: toModel.F,
    _shadingMode: toModel._shadingMode || 'auto',
    _creaseAngleDeg: toModel._creaseAngleDeg,
  };

  const baseCount = Math.max(fromModel.V.length, toModel.V.length, 180);
  const sampleCount = Math.min(MORPH_POINT_CAP, baseCount);

  MORPH = {
    active: true,
    startMs: nowMs,
    durationMs: MORPH_DURATION_MS,
    fromModel,
    toModel,
    fromPts: sampleVerticesForMorph(fromModel.V, sampleCount),
    toPts: sampleVerticesForMorph(toModel.V, sampleCount),
    sampleCount,
    targetName: obj.name,
    targetV: toModel.V.length,
    targetE: toModel.E.length,
    targetFrameParams: computeFrameParams(toModel.V),
    meshFromPts,
    meshToPts: toModel.V,
    meshModel,
  };

  console.log(`[startMorphToObject] Morphing to ${obj.name}: V=${toModel.V.length}, E=${toModel.E.length}`);
  const morphParams = computeFrameParams(toModel.V);
  updateHud(`${obj.name} (morphing)`, toModel.V.length, toModel.E.length, morphParams.cy, morphParams.zHalf);
}

// Add a visible debug overlay to the page for mesh decimation status
function showDecimationDebugInfo(current, target) {
  let dbg = document.getElementById('decimation-debug');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'decimation-debug';
    dbg.style.position = 'fixed';
    dbg.style.bottom = '10px';
    dbg.style.right = '10px';
    dbg.style.background = 'rgba(0,0,0,0.8)';
    dbg.style.color = '#fff';
    dbg.style.font = 'bold 15px monospace';
    dbg.style.padding = '8px 16px';
    dbg.style.zIndex = 9999;
    dbg.style.borderRadius = '8px';
    document.body.appendChild(dbg);
  }
  dbg.textContent = `Decimator: vertices=${current}, target=${target}`;
}

