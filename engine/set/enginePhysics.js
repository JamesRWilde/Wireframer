/**
 * SetEnginePhysics.js - Rotation Physics Update
 * 
 * PURPOSE:
 *   Updates the model's rotation each frame based on angular velocities and
 *   user input. Handles auto-rotation, drag interaction, and rotation matrix
 *   maintenance (re-orthogonalization to prevent drift).
 * 
 * ARCHITECTURE ROLE:
 *   Called by runFrame() each frame before rendering. Updates the global
 *   rotation matrix (PHYSICS_STATE.R) that the rendering pipeline uses
 *   to transform vertices.
 * 
 * PHYSICS MODEL:
 *   - Angular velocities (wx, wy, wz) control rotation speed around each axis
 *   - Auto-rotation gradually eases velocities toward AUTO_* targets
 *   - User drag applies friction to slow rotation
 *   - Rotation matrix is periodically re-orthogonalized to prevent numerical drift
 */

"use strict";

// Import the function that applies Euler angle increments to the rotation matrix
// This updates the rotation matrix in-place based on angular velocities
import { applyEulerIncrementInPlace } from '../get/renderEngineApplyEulerIncrement.js';

// Import the re-orthogonalization function
// This corrects numerical drift in the rotation matrix (prevents skewing)
import { reorthogonalize } from '../get/renderEngineReorthogonalize.js';

// Import loop state for frame counting
import { state } from '../state/engineLoop.js';

/**
 * SetEnginePhysics - Updates rotation physics for the current frame
 * 
 * @returns {number} Time spent on physics update (milliseconds)
 *   Used by telemetry to display physics performance
 * 
 * This function:
 * 1. Checks if rotation is paused (HOLD_ROTATION_FRAMES > 0)
 * 2. Applies angular velocity to rotation matrix
 * 3. Periodically re-orthogonalizes the rotation matrix
 * 4. Updates angular velocities based on drag state
 */
export function enginePhysics() {
  // Record start time for performance measurement
  const physStartMs = performance.now();
  
  // Check if rotation is paused (user is interacting)
  // HOLD_ROTATION_FRAMES is decremented each frame until it reaches 0
  if (globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES > 0) {
    // Rotation is paused - just decrement the counter
    globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES = globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES - 1;
  } else {
    // Rotation is active - apply angular velocities to rotation matrix
    
    // Get the current rotation matrix
    const currentR = globalThis.PHYSICS_STATE.R;
    
    // Apply Euler angle increments based on current angular velocities
    // This updates the rotation matrix in-place
    applyEulerIncrementInPlace(currentR, globalThis.PHYSICS_STATE.wx, globalThis.PHYSICS_STATE.wy, globalThis.PHYSICS_STATE.wz);
    
    // Periodically re-orthogonalize the rotation matrix
    // Numerical errors accumulate over time, causing the matrix to drift
    // from being a pure rotation (skewing/scaling artifacts)
    // We do this every 120 frames (~2 seconds at 60fps) to balance
    // accuracy with performance
    if ((++state.frameCount) % 120 === 0) {
      globalThis.PHYSICS_STATE.R = reorthogonalize(globalThis.PHYSICS_STATE.R);
    }

    // Update angular velocities based on interaction state
    if (globalThis.PHYSICS_STATE.dragging) {
      // User is dragging - apply friction to angular velocities
      // This causes the model to slow down when the user stops dragging
      // The 0.85 factor means velocity retains 85% each frame
      // This creates a smooth deceleration effect
      globalThis.PHYSICS_STATE.wx *= 0.85;
      globalThis.PHYSICS_STATE.wy *= 0.85;
      globalThis.PHYSICS_STATE.wz *= 0.85;
    } else {
      // Not dragging - ease velocities toward auto-rotation targets
      // This produces smooth continuous rotation without oscillation
      // The 0.04 factor means we move 4% of the way toward the target each frame
      // This creates a smooth acceleration/deceleration curve
      globalThis.PHYSICS_STATE.wx += (globalThis.PHYSICS_STATE.AUTO_WX - globalThis.PHYSICS_STATE.wx) * 0.04;
      globalThis.PHYSICS_STATE.wy += (globalThis.PHYSICS_STATE.AUTO_WY - globalThis.PHYSICS_STATE.wy) * 0.04;
      globalThis.PHYSICS_STATE.wz += (globalThis.PHYSICS_STATE.AUTO_WZ - globalThis.PHYSICS_STATE.wz) * 0.04;

      // Debug logging for physics state (only when DEBUG_LOG_PHYSICS is set)
      if (globalThis.DEBUG_LOG_PHYSICS) {
        console.log('[SetEnginePhysics] wx,wy,wz',
                    globalThis.PHYSICS_STATE.wx.toFixed(3),
                    globalThis.PHYSICS_STATE.wy.toFixed(3),
                    globalThis.PHYSICS_STATE.wz.toFixed(3));
        console.log('[SetEnginePhysics] R row0',
                    globalThis.PHYSICS_STATE.R[0].toFixed(3),
                    globalThis.PHYSICS_STATE.R[1].toFixed(3),
                    globalThis.PHYSICS_STATE.R[2].toFixed(3));
      }
    }
  }
  
  // Return time spent on physics for telemetry
  return performance.now() - physStartMs;
}
