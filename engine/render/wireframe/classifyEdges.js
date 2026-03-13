"use strict";

import { getModelTriangles } from '../../fill/getModelTriangles.js';

/**
 * Compute face normal from transformed vertices T (view space).
 */
function computeFaceNormalViewSpace(T, a, b, c) {
  const ax = T[a][0], ay = T[a][1], az = T[a][2];
  const bx = T[b][0], by = T[b][1], bz = T[b][2];
  const cx = T[c][0], cy = T[c][1], cz = T[c][2];

  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = cx - ax, vy = cy - ay, vz = cz - az;

  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;

  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-9) return null;
  return [nx / nl, ny / nl, nz / nl];
}

/**
 * Classifies edges as 'front', 'back', or 'silhouette' based on adjacent face normals.
 * Normals are computed from transformed vertices T (view space), so classification
 * updates correctly on every rotation.
 * Returns a Map from edge key "a|b" to classification string.
 */
export function classifyEdges(model, T) {
  const triFaces = getModelTriangles(model);
  if (!triFaces?.length) return new Map();

  // Build edge-to-faces adjacency
  const edgeToFaces = new Map();
  for (let fi = 0; fi < triFaces.length; fi++) {
    const tri = triFaces[fi];
    const edges = [
      [tri[0], tri[1]],
      [tri[1], tri[2]],
      [tri[2], tri[0]]
    ];
    for (const [a, b] of edges) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
      edgeToFaces.get(key).push(fi);
    }
  }

  // Compute face normals from transformed vertices (view space)
  const faceNormals = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    faceNormals[i] = computeFaceNormalViewSpace(T, tri[0], tri[1], tri[2]);
  }

  // View direction is along negative Z in camera space
  const viewDir = [0, 0, -1];
  const classification = new Map();

  for (const [key, faceIndices] of edgeToFaces) {
    let frontCount = 0;
    let backCount = 0;

    for (const fi of faceIndices) {
      const n = faceNormals[fi];
      if (!n) continue;
      // Dot product with view direction (0,0,-1): negative = front-facing
      // (normal points toward camera which is at +Z relative to face)
      const dot = n[0] * viewDir[0] + n[1] * viewDir[1] + n[2] * viewDir[2];
      if (dot < -0.01) frontCount++;
      else if (dot > 0.01) backCount++;
    }

    if (frontCount > 0 && backCount > 0) {
      classification.set(key, 'silhouette');
    } else if (frontCount > 0) {
      classification.set(key, 'front');
    } else if (backCount > 0) {
      classification.set(key, 'back');
    } else {
      classification.set(key, 'front');
    }
  }

  return classification;
}
