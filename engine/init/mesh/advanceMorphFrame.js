/**
 * advanceMorphFrame.js - 3-Phase Morph in Bounding Sphere Space
 *
 * The sphere is law. Vertices move along the sphere surface (slerp),
 * never through the sphere interior. This guarantees the visual centroid
 * stays at the sphere centre — no drift, ever.
 */

"use strict";

import { morphState } from '@engine/state/mesh/morph.js';
import { easeOut } from '@engine/get/mesh/easeOut.js';
import { interpolateMeshes } from '@engine/init/mesh/interpolateMeshes.js';
import { clone } from '@engine/init/mesh/clone.js';

/** Phase boundaries (of total progress 0→1) */
const PHASE1_END = 0.33;
const PHASE2_END = 0.67;

/**
 * interpolateInSphere - Vertex interpolation that keeps the sphere law.
 * - Vertices on the sphere (r ≥ 0.95) use slerp: stays on surface, zero drift.
 * - Vertices inside (r < 0.95) use lerp + clamp: can't escape the sphere.
 */
function interpolateInSphere(a, b, t) {
  if (t <= 0) return [a[0], a[1], a[2]];
  if (t >= 1) return [b[0], b[1], b[2]];

  const rA = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
  const rB = Math.sqrt(b[0]*b[0] + b[1]*b[1] + b[2]*b[2]);

  // If both vertices are on the sphere surface, use slerp
  if (rA > 0.95 && rB > 0.95) {
    const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
    const sinA = Math.sin(angle);

    if (sinA < 1e-6) {
      const r = Math.sqrt((a[0]+b[0])**2 + (a[1]+b[1])**2 + (a[2]+b[2])**2) || 1;
      return [(a[0]+b[0])/r, (a[1]+b[1])/r, (a[2]+b[2])/r];
    }

    const wA = Math.sin((1 - t) * angle) / sinA;
    const wB = Math.sin(t * angle) / sinA;
    const x = wA*a[0] + wB*b[0];
    const y = wA*a[1] + wB*b[1];
    const z = wA*a[2] + wB*b[2];
    const r = Math.sqrt(x*x + y*y + z*z) || 1;
    return [x/r, y/r, z/r];
  }

  // Interior vertices: lerp + sphere clamp
  const x = a[0] + (b[0] - a[0]) * t;
  const y = a[1] + (b[1] - a[1]) * t;
  const z = a[2] + (b[2] - a[2]) * t;
  const r2 = x*x + y*y + z*z;
  if (r2 > 1) {
    const r = Math.sqrt(r2);
    return [x/r, y/r, z/r];
  }
  return [x, y, z];
}

/**
 * advanceMorphFrame - 3-phase morph animation
 */
export function advanceMorphFrame() {
  if (!morphState.active) return;

  const now = performance.now();
  const tRaw = Math.min(1, (now - morphState.startTime) / morphState.duration);
  morphState.progress = tRaw;

  const fromMesh = morphState.fromMesh;
  const toMesh = morphState.toMesh;
  const fromDec = morphState.fromDecimated;
  const toDec = morphState.toDecimated;
  const morphMap = morphState.morphMap;

  let mesh;

  if (tRaw <= PHASE1_END) {
    // ===== PHASE 1: Smooth decimation along sphere surface =====
    const t = easeOut(tRaw / PHASE1_END);
    const fromV = fromMesh.V;
    const decV = fromDec.V;
    const oldToNew = fromMesh._oldToNew;

    const V = fromV.map((v, i) => {
      const decIdx = oldToNew ? oldToNew[i] : i % decV.length;
      const target = decV[decIdx] || v;
      return interpolateInSphere(v, target, t);
    });

    mesh = {
      V,
      F: fromMesh.F.map(f => Array.isArray(f) ? f.slice() : { ...f }),
      E: fromMesh.E.map(e => e.slice()),
      _shadingMode: fromMesh._shadingMode,
      _creaseAngleDeg: fromMesh._creaseAngleDeg,
    };

  } else if (tRaw <= PHASE2_END) {
    // ===== PHASE 2: Low-poly spatial morph along sphere surface =====
    const t = easeOut((tRaw - PHASE1_END) / (PHASE2_END - PHASE1_END));

    let V;
    if (morphMap) {
      const decV = fromDec.V;
      const tx = morphMap.tx;
      const ty = morphMap.ty;
      const tz = morphMap.tz;

      V = decV.map((v, i) => {
        const target = [tx[i], ty[i], tz[i]];
        return interpolateInSphere(v, target, t);
      });
    } else {
      const fallback = interpolateMeshes(fromDec, toDec, t, null);
      V = fallback.V.map(v => {
        const r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return r > 0 ? [v[0]/r, v[1]/r, v[2]/r] : v;
      });
    }

    mesh = {
      V,
      F: fromDec.F.map(f => Array.isArray(f) ? f.slice() : { ...f }),
      E: fromDec.E.map(e => e.slice()),
      _shadingMode: fromMesh._shadingMode,
      _creaseAngleDeg: fromMesh._creaseAngleDeg,
    };

  } else {
    // ===== PHASE 3: Smooth re-detail along sphere surface =====
    const t = easeOut((tRaw - PHASE2_END) / (1 - PHASE2_END));
    const toV = toMesh.V;
    const oldToNew = toMesh._oldToNew;

    const V = toV.map((v, i) => {
      const decIdx = oldToNew ? oldToNew[i] : i % toDec.V.length;
      const fromPos = toDec.V[decIdx] || v;
      return interpolateInSphere(fromPos, v, t);
    });

    mesh = {
      V,
      F: toMesh.F.map(f => Array.isArray(f) ? f.slice() : { ...f }),
      E: toMesh.E.map(e => e.slice()),
      _shadingMode: toMesh._shadingMode,
      _creaseAngleDeg: toMesh._creaseAngleDeg,
    };
  }

  morphState.currentMesh = mesh;

  // Handle completion
  if (tRaw >= 1) {
    morphState.active = false;
    morphState.currentMesh = clone(morphState.toMesh);
    if (morphState.onComplete) morphState.onComplete();
  }
}
