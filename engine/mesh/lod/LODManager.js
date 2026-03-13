"use strict";

import { deepCopyMesh } from './deepCopyMesh.js';
import { decimateMeshByPercent } from './decimateMeshByPercent.js';
import { greedyClusterDecimator } from './greedyClusterDecimator.js';

/**
 * LODManager - wraps mesh decimation utilities for LOD control
 */
class LODManager {
  static MIN_VERTS = 3;

  static deepCopyMesh(model) {
    return deepCopyMesh(model);
  }

  static decimateMeshByPercent(model, percent) {
    if (!model || !Array.isArray(model.V) || model.V.length < LODManager.MIN_VERTS) {
      return LODManager.deepCopyMesh(model);
    }
    return decimateMeshByPercent(model, percent);
  }

  static greedyClusterDecimator(model, targetFaces) {
    return greedyClusterDecimator(model, targetFaces);
  }
}

// Expose globally for setDetailLevel and UI
globalThis.LODManager = LODManager;
