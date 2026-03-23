/**
 * startMorph.js - Initialise and Start a 3-Phase Morph Animation
 *
 * PURPOSE:
 *   Prepares the morph animation state by cloning source and target meshes,
 *   decimating both to a common low detail level, computing the nearest-vertex
 *   morph map, and populating the shared morphState object. Once initialisation
 *   is complete, advanceMorphFrame drives the actual animation.
 *
 * ARCHITECTURE ROLE:
 *   Called when the user switches objects (or triggers a morph). Sets up all
 *   precomputed data (decimated meshes, morph map) so advanceMorphFrame can
 *   run with zero setup cost per frame. All meshes are in bounding sphere
 *   space (radius 1, centre at origin), so no alignment step is needed.
 *
 * MORPH PIPELINE:
 *   startMorph → [advanceMorphFrame x N frames] → completion
 *     1. Decimate both meshes to MORPH_DETAIL (10% vertex count)
 *     2. Recenter decimated meshes to origin (compensates centroid shift from decimation)
 *     3. Compute morphMap: nearest-vertex spatial mapping between decimated meshes
 *     4. Recenter full meshes to origin (same drift compensation)
 *     5. Populate morphState — advanceMorphFrame reads this each frame
 *
 * DEPENDENCIES:
 *   - clone: Deep-copies meshes to avoid mutating the originals
 *   - decimateByPercent: Reduces mesh to low-poly form for Phase 2
 *   - computeMorphMap: Builds nearest-vertex mapping for Phase 2 spatial morph
 *   - morphState (engine/state/mesh/morph.js): Shared animation state singleton
 *
 * SPHERE LAW:
 *   All meshes must already be in bounding sphere space (radius 1, centre at
 *   origin) before calling this function. The morph animation preserves this
 *   invariant — vertices never escape the unit sphere.
 */

"use strict";

import { morphState } from '@engine/state/mesh/morph.js';
import { cloneMesh } from '@engine/init/mesh/cloneMesh.js';
import { computeMorphMap } from '@engine/init/mesh/computeMorphMap.js';
import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';
import { getZoom } from '@engine/state/render/zoomState.js';
import { recenterToOrigin } from '@engine/init/mesh/recenterToOrigin.js';

/**
 * Target detail level for decimated meshes (10% of original vertex count).
 * Controls the resolution of Phase 2 (spatial morph between low-poly forms).
 * Lower values = faster Phase 2 but blockier intermediate shape.
 * @type {number}
 */
const MORPH_DETAIL = 0.1;

/**
 * startMorph - Initialises and starts a 3-phase morph animation between two meshes.
 *
 * Clones both meshes to avoid mutating originals, decimates them to a common
 * low-poly form, computes the nearest-vertex morph map, and populates morphState.
 * The animation begins immediately — advanceMorphFrame will read morphState
 * on the next frame.
 *
 * On completion, morphState.currentMesh is set to a clone of toMesh and the
 * onComplete callback fires (if provided).
 *
 * @param {Object} fromMesh - Source mesh (high-poly, in bounding sphere space)
 * @param {Object} toMesh - Target mesh (high-poly, in bounding sphere space)
 * @param {number} durationMs - Animation duration in milliseconds
 * @param {Function} [onComplete] - Callback fired when morph finishes (receives no args)
 *
 * @returns {void}
 */

export function startMorph(fromMesh, toMesh, durationMs, onComplete) {
  // Clone both meshes to avoid mutating the originals
  const fromClone = cloneMesh(fromMesh);
  const toClone = cloneMesh(toMesh);

  // Decimate both meshes to common low detail level (10% of original vertices)
  const fromDec = decimateByPercent(fromClone, MORPH_DETAIL);
  const toDec = decimateByPercent(toClone, MORPH_DETAIL);

  // Recenter decimated meshes to origin. Decimation merges clusters
  // which shifts centroids slightly — that causes the mesh to drift
  // toward a corner during Phase 2. Re-centering keeps the morph
  // anchored at screen centre throughout.
  recenterToOrigin(fromDec);
  recenterToOrigin(toDec);

  // Compute morph map between recentered decimated meshes.
  // Maps each vertex in fromDec to its nearest neighbour in toDec,
  // providing target positions for the Phase 2 spatial morph.
  const morphMap = computeMorphMap(fromDec, toDec);

  // Also ensure source and target full meshes are centered
  recenterToOrigin(fromClone);
  recenterToOrigin(toClone);

  // Populate morphState — advanceMorphFrame reads this each frame
  morphState.active = true;
  morphState.startTime = performance.now();
  morphState.duration = durationMs;
  morphState.fromMesh = fromClone;
  morphState.toMesh = toClone;
  morphState.fromDecimated = fromDec;
  morphState.toDecimated = toDec;
  morphState.morphMap = morphMap;
  morphState.currentMesh = cloneMesh(fromClone);
  morphState.progress = 0;
  morphState.onComplete = typeof onComplete === 'function' ? onComplete : null;
  morphState.startZoom = getZoom();
}
