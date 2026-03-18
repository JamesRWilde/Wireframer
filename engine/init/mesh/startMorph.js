/**
 * startMorph.js - 3-Phase Morph
 *
 * All meshes are in bounding sphere space (radius 1, centre at origin).
 * No alignment needed — just decimate both, compute morph map, go.
 */

"use strict";

import { morphState } from '@engine/state/mesh/morph.js';
import { clone } from '@engine/init/mesh/clone.js';
import { computeMorphMap } from '@engine/init/mesh/computeMorphMap.js';
import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';

const MORPH_DETAIL = 0.1;

export function startMorph(fromMesh, toMesh, durationMs, onComplete) {
  const fromClone = clone(fromMesh);
  const toClone = clone(toMesh);

  // Decimate both meshes to common low detail level
  const fromDec = decimateByPercent(fromClone, MORPH_DETAIL);
  const toDec = decimateByPercent(toClone, MORPH_DETAIL);

  // Recenter decimated meshes to origin. Decimation merges clusters
  // which shifts centroids slightly — that causes the mesh to drift
  // toward a corner during Phase 2. Re-centering keeps the morph
  // anchored at screen centre throughout.
  function recenterToOrigin(mesh) {
    let cx = 0, cy = 0, cz = 0;
    const n = mesh.V.length;
    for (let i = 0; i < n; i++) { cx += mesh.V[i][0]; cy += mesh.V[i][1]; cz += mesh.V[i][2]; }
    cx /= n; cy /= n; cz /= n;
    for (let i = 0; i < n; i++) { mesh.V[i][0] -= cx; mesh.V[i][1] -= cy; mesh.V[i][2] -= cz; }
  }
  recenterToOrigin(fromDec);
  recenterToOrigin(toDec);

  // Compute morph map between recentered decimated meshes
  const morphMap = computeMorphMap(fromDec, toDec);

  // Also ensure source and target full meshes are centered
  recenterToOrigin(fromClone);
  recenterToOrigin(toClone);

  morphState.active = true;
  morphState.startTime = performance.now();
  morphState.duration = durationMs;
  morphState.fromMesh = fromClone;
  morphState.toMesh = toClone;
  morphState.fromDecimated = fromDec;
  morphState.toDecimated = toDec;
  morphState.morphMap = morphMap;
  morphState.currentMesh = clone(fromClone);
  morphState.progress = 0;
  morphState.onComplete = typeof onComplete === 'function' ? onComplete : null;
  morphState.startZoom = globalThis.ZOOM;
}
