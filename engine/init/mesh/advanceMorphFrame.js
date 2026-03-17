/**
 * advanceMorphFrame.js - Morph Frame Advancement
 * 
 * PURPOSE:
 *   Advances the morph animation by one frame. This function is called each
 *   frame by renderScene to update the morph state and compute the current
 *   interpolated mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame when a morph is active. Part of the
 *   morph API exposed globally via morphApi.js.
 * 
 * HOW IT WORKS:
 *   1. Calculate raw progress (0-1) from elapsed time
 *   2. Apply easing function for smooth animation
 *   3. Interpolate between source and target meshes
 *   4. If complete, finalize and invoke callback
 */

"use strict";

// Import morph state for reading/updating animation state
import {morphState} from '@engine/state/mesh/morph.js';

// Import easing function for smooth animation
import {easeOut}from '@engine/get/mesh/easeOut.js';

// Import mesh interpolation for computing intermediate meshes
import { interpolateMeshes }from '@engine/init/mesh/interpolateMeshes.js';

// Import mesh cloning for final mesh copy
import { clone }from '@engine/init/mesh/clone.js';

/**
 * advanceMorphFrame - Advances morph animation by one frame
 * 
 * This function:
 * 1. Calculates progress from elapsed time
 * 2. Applies easing for smooth motion
 * 3. Interpolates meshes at current progress
 * 4. Handles completion (finalizes mesh, invokes callback)
 */
export function advanceMorphFrame() {
  // Skip if no morph is active
  if (!morphState.active) return;
  
  // Calculate raw progress (0-1) from elapsed time
  const now = performance.now();
  const tRaw = Math.min(1, (now - morphState.startTime) / morphState.duration);
  
  // Store raw progress for external access
  morphState.progress = tRaw;
  
  // Apply easing function for smooth animation
  // EaseInOut provides smooth acceleration and deceleration
  const t = easeOut(tRaw);
  
  // Interpolate between source and target meshes at current progress
  morphState.currentMesh = interpolateMeshes(morphState.fromMesh, morphState.toMesh, t);
  
  // Check if animation is complete
  if (tRaw >= 1) {
    // Mark morph as inactive
    morphState.active = false;
    
    // Set current mesh to exact target (avoid floating-point drift)
    morphState.currentMesh = clone(morphState.toMesh);
    
    // Invoke completion callback if provided
    if (morphState.onComplete) morphState.onComplete();
  }
}
