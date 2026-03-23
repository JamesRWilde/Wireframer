/**
 * advanceMorphFrame.js - 3-Phase Morph in Bounding Sphere Space
 *
 * PURPOSE:
 *   Advances the morph animation by one frame using a 3-phase interpolation
 *   system. Each phase transitions the mesh through a specific deformation
 *   stage while keeping all vertices on or inside the bounding sphere.
 *
 * ARCHITECTURE ROLE:
 *   Called every frame from the render loop when morphState.active is true.
 *   Produces a new mesh object (morphState.currentMesh) that the renderer
 *   draws in place of the static mesh until the animation completes.
 *
 * THREE PHASES:
 *   1. Decimation (0 → 0.33): High-poly source smooths toward low-poly shape
 *      using the _oldToNew cluster mapping. Vertices slide along sphere surface.
 *   2. Spatial morph (0.33 → 0.67): Low-poly mesh morphs to target low-poly
 *      shape using the precomputed morphMap (nearest-vertex spatial mapping).
 *   3. Re-detail (0.67 → 1.0): Low-poly target expands into full-detail target
 *      using the _oldToNew mapping in reverse. Vertices slide along sphere surface.
 *
 * SPHERE LAW:
 *   Every vertex interpolation uses interpolateInSphere, which ensures:
 *   - Surface vertices (r ≥ 0.95) use slerp: stays on sphere surface, zero drift
 *   - Interior vertices (r < 0.95) use lerp + clamp: can't escape the sphere
 *   This guarantees the visual centroid never moves from the sphere centre.
 *
 * STATE:
 *   Reads from and writes to morphState (engine/state/mesh/morph.js).
 *   On completion, replaces currentMesh with a clone of toMesh and fires
 *   the onComplete callback.
 */

"use strict";

import { morphState } from '@engine/state/mesh/morph.js';
import { getEaseOut } from '@engine/get/mesh/getEaseOut.js';
import { cloneMesh } from '@engine/init/mesh/cloneMesh.js';
import { interpolateInSphere } from '@engine/init/mesh/interpolateInSphere.js';

/**
 * Phase boundaries as fractions of total progress (0 → 1).
 * Each phase gets roughly equal time allocation.
 * @type {number}
 */
const PHASE1_END = 0.33;

/** @type {number} */
const PHASE2_END = 0.67;

/**
 * advanceMorphFrame - Advances the morph animation by one frame.
 *
 * Called every frame while morphState.active is true. Computes the current
 * animation progress from elapsed time, selects the appropriate phase based
 * on progress, and produces a new mesh with interpolated vertex positions.
 *
 * The returned mesh is stored in morphState.currentMesh for the renderer
 * to draw. On animation completion (progress reaches 1), the mesh is replaced
 * with a clone of toMesh and the onComplete callback fires.
 *
 * No-op if morphState.active is false.
 *
 * @returns {void}
 */
export function advanceMorphFrame() {
  // Guard: only run when a morph is active
  if (!morphState.active) return;

  // Calculate progress from elapsed time (0 = start, 1 = complete)
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
    // Source mesh collapses toward its decimated (low-poly) form using
    // the _oldToNew cluster mapping. Each high-poly vertex finds its
    // target in the decimated mesh and slides there along the sphere.
    const t = getEaseOut(tRaw / PHASE1_END);
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
    // Decimated source morphs to decimated target using the precomputed
    // morphMap (nearest-vertex spatial mapping via computeMorphMap).
    // The morphMap must exist — if null, something went wrong in startMorph.
    const t = getEaseOut((tRaw - PHASE1_END) / (PHASE2_END - PHASE1_END));

    if (!morphMap) throw new Error('Phase 2 morph requires morphMap but it was null');

    const decV = fromDec.V;
    const tx = morphMap.tx;
    const ty = morphMap.ty;
    const tz = morphMap.tz;

    const V = decV.map((v, i) => {
      const target = [tx[i], ty[i], tz[i]];
      return interpolateInSphere(v, target, t);
    });

    mesh = {
      V,
      F: fromDec.F.map(f => Array.isArray(f) ? f.slice() : { ...f }),
      E: fromDec.E.map(e => e.slice()),
      _shadingMode: fromMesh._shadingMode,
      _creaseAngleDeg: fromMesh._creaseAngleDeg,
    };

  } else {
    // ===== PHASE 3: Smooth re-detail along sphere surface =====
    // Decimated target expands into full-detail target using the _oldToNew
    // cluster mapping. Each decimated vertex fans out to its original
    // high-poly positions, sliding along the sphere surface.
    const t = getEaseOut((tRaw - PHASE2_END) / (1 - PHASE2_END));
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

  // Store the computed mesh for the renderer to draw this frame
  morphState.currentMesh = mesh;

  // Handle animation completion
  if (tRaw >= 1) {
    morphState.active = false;
    morphState.currentMesh = cloneMesh(morphState.toMesh);
    if (morphState.onComplete) morphState.onComplete();
  }
}
