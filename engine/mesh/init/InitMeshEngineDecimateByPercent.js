/**
 * InitMeshEngineDecimateByPercent.js - LOD Decimation by Percentage
 * 
 * PURPOSE:
 *   Reduces a mesh's complexity to a target percentage of its original face count.
 *   This is the primary entry point for LOD (Level of Detail) operations, called
 *   when the user adjusts the detail slider.
 * 
 * ARCHITECTURE ROLE:
 *   Called by SetMeshEngineDetailLevel to generate LOD versions of the base model.
 *   Delegates to InitMeshEngineGreedyClusterDecimator for the actual decimation algorithm.
 * 
 * HOW IT WORKS:
 *   1. Validates input model
 *   2. Calculates target face count from percentage
 *   3. If at 100%, returns original model (no decimation needed)
 *   4. Otherwise, calls InitMeshEngineGreedyClusterDecimator to reduce faces
 */

"use strict";

// Import the greedy cluster decimation algorithm
// This groups nearby vertices and merges them to reduce face count
import { InitMeshEngineGreedyClusterDecimator } from './InitMeshEngineGreedyClusterDecimator.js';

/**
 * InitMeshEngineDecimateByPercent - Decimates a mesh to a target percentage of faces
 * 
 * @param {Object} model - The mesh model to decimate
 * @param {number} percent - Target percentage (0-1) of original face count
 *   1 = full detail (all faces)
 *   0 = minimum detail (fewest faces)
 * 
 * @returns {Object} The decimated mesh model
 *   Returns original model if percent >= 1 or model is invalid
 * 
 * The function:
 * 1. Guards against invalid input (null, too few vertices)
 * 2. Calculates target face count with minimum of 4 faces
 * 3. Returns original model if target >= current (no decimation needed)
 * 4. Otherwise delegates to InitMeshEngineGreedyClusterDecimator
 */
export function InitMeshEngineDecimateByPercent(model, percent) {
    // Guard: return original model if invalid or too few vertices
    if (!model || !Array.isArray(model.V) || model.V.length < 3) return model;
    
    // Get original face count
    const faceCount = model.F.length;
    
    // Calculate target face count with minimum of 4 faces
    // We need at least 4 faces to have a valid 3D mesh (tetrahedron)
    const minFaces = 4;
    const targetFaces = Math.max(minFaces, Math.round(percent * faceCount));
    
    // If target >= current, return original model (no decimation needed)
    // This avoids unnecessary computation and preserves full quality
    if (targetFaces >= faceCount) {
        // At 100%, return the original model directly - no copy needed
        return model;
    }
    
    // Delegate to greedy cluster decimator for actual decimation
    return InitMeshEngineGreedyClusterDecimator(model, targetFaces);
}