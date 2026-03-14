/**
 * morphStep.js - Single Morph Step (External Time)
 * 
 * PURPOSE:
 *   Advances the morph animation by one step using an externally provided
 *   timestamp. This is similar to advanceMorphFrame but accepts the timestamp
 *   as a parameter rather than reading it internally.
 * 
 * ARCHITECTURE ROLE:
 *   Alternative entry point for morph advancement when the caller wants to
 *   control the timing. Useful for testing or when morph needs to be driven
 *   by an external clock.
 * 
 * DIFFERENCE FROM advanceMorphFrame:
 *   - advanceMorphFrame: Reads time internally via performance.now()
 *   - morphStep: Accepts time as a parameter
 */

"use strict";

// Import morph state for reading/updating animation state
import { morphState } from '../morphState.js';

// Import easing function for smooth animation
import { easeInOut } from './easeInOut.js';

// Import mesh interpolation for computing intermediate meshes
import { interpolateMeshes } from './interpolateMeshes.js';

// Import mesh cloning for final mesh copy
import { cloneMesh } from './cloneMesh.js';

/**
 * morphStep - Advances morph animation using external timestamp
 * 
 * @param {number} nowMs - Current timestamp in milliseconds
 * 
 * This function:
 * 1. Calculates progress from provided timestamp
 * 2. Applies easing for smooth motion
 * 3. Interpolates meshes at current progress
 * 4. Handles completion (finalizes mesh, invokes callback)
 */
export function morphStep(nowMs) {
  // Skip if no morph is active
  if (!morphState.active) return;
  
  // Calculate raw progress (0-1) from provided timestamp
  const tRaw = Math.min(1, (nowMs - morphState.startTime) / morphState.duration);
  
  // Store raw progress for external access
  morphState.progress = tRaw;
  
  // Apply easing function for smooth animation
  const t = easeInOut(tRaw);
  
  // Interpolate between source and target meshes at current progress
  morphState.currentMesh = interpolateMeshes(morphState.fromMesh, morphState.toMesh, t);
  
  // Check if animation is complete
  if (tRaw >= 1) {
    // Mark morph as inactive
    morphState.active = false;
    
    // Set current mesh to exact target (avoid floating-point drift)
    morphState.currentMesh = cloneMesh(morphState.toMesh);
    
    // Invoke completion callback if provided
    if (morphState.onComplete) morphState.onComplete();
  }
}