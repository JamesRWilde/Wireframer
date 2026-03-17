/**
 * InitMeshEngineStartMorph.js - Morph Animation Initialization
 * 
 * PURPOSE:
 *   Starts a morph animation between two mesh models. This function sets up
 *   the morph state with source and target meshes, duration, and completion
 *   callback, preparing the animation to be advanced each frame.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineFinalizeModel when loading a new mesh with animation enabled.
 *   Part of the morph API exposed globally via InitMeshEngineMorphApi.js.
 * 
 * HOW IT WORKS:
 *   1. Clones both source and target meshes to prevent mutation
 *   2. Sets up morph state with timing and callback
 *   3. Initializes current mesh to source (starting point)
 *   4. Subsequent frames call InitMeshEngineAdvanceMorphFrame to interpolate
 */

"use strict";

// Import morph state for updating animation parameters
import { morphState } from '../state/stateMeshEngineMorph.js';

// Import mesh cloning to prevent mutation of original meshes
import { initMeshEngineClone } from './initMeshEngineClone.js';

/**
 * InitMeshEngineStartMorph - Starts a morph animation between two meshes
 * 
 * @param {Object} fromMesh - Source mesh (starting point)
 * @param {Object} toMesh - Target mesh (ending point)
 * @param {number} durationMs - Animation duration in milliseconds
 * @param {Function} [onComplete] - Callback when animation completes
 * 
 * Both meshes are cloned to prevent mutation during interpolation.
 * The current mesh is initialized to the source mesh.
 */
export function initMeshEngineStartMorph(fromMesh, toMesh, durationMs, onComplete) {
  // Mark morph as active
  morphState.active = true;
  
  // Record start time for progress calculation
  morphState.startTime = performance.now();
  
  // Set animation duration
  morphState.duration = durationMs;
  
  // Clone source and target meshes to prevent mutation
  // Interpolation will modify vertices in-place, so we need copies
  morphState.fromMesh = InitMeshEngineClone(fromMesh);
  morphState.toMesh = InitMeshEngineClone(toMesh);
  
  // Initialize current mesh to source (starting point)
  morphState.currentMesh = InitMeshEngineClone(fromMesh);
  
  // Reset progress to start
  morphState.progress = 0;
  
  // Store completion callback (if provided)
  morphState.onComplete = typeof onComplete === 'function' ? onComplete : null;
}