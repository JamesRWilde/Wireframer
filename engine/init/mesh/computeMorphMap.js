/**
 * computeMorphMap.js - Spatial Nearest-Neighbor Vertex Mapping for Morphing
 *
 * PURPOSE:
 *   Precomputes a mapping from each source vertex to the nearest vertex
 *   on the target mesh, along with the pre-resolved target positions.
 *   Uses a spatial hash grid for O(n) performance.
 *
 * HOW IT WORKS:
 *   1. Build a 3D spatial grid of target vertices
 *   2. For each source vertex, find the nearest target vertex
 *   3. Return mapping as arrays of target X/Y/Z positions (fast lerp)
 *
 * USAGE IN MORPH:
 *   During animation, each source vertex interpolates toward its mapped
 *   target position. At low decimation levels, spatial correspondence is
 *   natural — no streaking.
 */

"use strict";

/** Grid cell size as a fraction of bounding box diagonal */
const CELL_SIZE_FACTOR = 0.02;

import { buildSpatialGrid } from '@engine/init/mesh/buildSpatialGrid.js';
import { probeGrid } from '@engine/init/mesh/probeGrid.js';
import { getBoundingBox } from '@engine/get/mesh/getBoundingBox.js';

/**
 * computeMorphMap - Precompute nearest-vertex mapping for morphing
 *
 * @param {Object} fromMesh - Source mesh { V: [[x,y,z],...], F: [...] }
 * @param {Object} toMesh - Target mesh { V: [[x,y,z],...], F: [...] }
 * @param {number} [scaleFactor=1] - Scale target positions to match source extent
 *
 * @returns {{ indices: number[], tx: number[], ty: number[], tz: number[] }}
 *   Pre-resolved target positions for fast interpolation.
 *   morph.tx[i] = X position of the target vertex nearest to fromMesh.V[i]
 */
export function computeMorphMap(fromMesh, toMesh, scaleFactor = 1) {
  const fromV = fromMesh.V;
  const toV = toMesh.V;
  const n = fromV.length;
  const indices = new Array(n);
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const tz = new Float32Array(n);

  if (toV.length === 0) {
    for (let i = 0; i < n; i++) {
      indices[i] = 0;
      tx[i] = fromV[i][0];
      ty[i] = fromV[i][1];
      tz[i] = fromV[i][2];
    }
    return { indices, tx, ty, tz };
  }

  const { minX, maxX, minY, maxY, minZ, maxZ } = getBoundingBox(toV);

  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;

  const diag = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ);
  const cellSize = Math.max(diag * CELL_SIZE_FACTOR, 1e-6);
  const min = [minX, minY, minZ];

  const grid = buildSpatialGrid(toV, min, cellSize);

  const scale = scaleFactor === 1 ? null : scaleFactor;

  for (let i = 0; i < n; i++) {
    const idx = probeGrid(fromV[i], grid, toV, min, cellSize);
    indices[i] = idx;

    const v = toV[idx];
    if (scale === null) {
      tx[i] = v[0];
      ty[i] = v[1];
      tz[i] = v[2];
    } else {
      tx[i] = cx + (v[0] - cx) * scale;
      ty[i] = cy + (v[1] - cy) * scale;
      tz[i] = cz + (v[2] - cz) * scale;
    }
  }

  return { indices, tx, ty, tz };
}
