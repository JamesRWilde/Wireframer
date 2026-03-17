/**
 * initializeRotation.js - Initial Rotation Matrix Setup
 * 
 * PURPOSE:
 *   Sets up the initial rotation matrix for the 3D model. This provides a
 *   pleasing default orientation that shows the model's 3D nature (not just
 *   a flat front view).
 * 
 * ARCHITECTURE ROLE:
 *   Called by startApp() before the animation loop begins. Initializes the
 *   global rotation matrix that the physics system and renderer use.
 * 
 * WHY THESE ANGLES:
 *   The combination of 0.4 radians (~23°) Y rotation and 0.18 radians (~10°)
 *   X rotation gives a slightly tilted, three-quarter view that showcases
 *   the model's depth and form.
 */

"use strict";

// Import matrix multiplication for combining rotations
import { mmul } from './mmul.js';

// Import Y-axis rotation matrix constructor
import { mry } from './mry.js';

// Import X-axis rotation matrix constructor
import { mrx } from './mrx.js';

// Import the global rotation matrix reference
import { R } from './R.js';

/**
 * initializeRotation - Sets up the initial rotation matrix
 * 
 * Creates a rotation matrix that combines:
 * - 0.4 radians rotation around Y axis (horizontal turn)
 * - 0.18 radians rotation around X axis (slight tilt)
 * 
 * This gives a pleasing three-quarter view of the model.
 * Falls back to identity matrix if rotation functions aren't available.
 */
export function initializeRotation() {
  // Check if rotation functions are available
  if (typeof mry === 'function' && typeof mrx === 'function' && typeof mmul === 'function') {
    // Create initial rotation: Ry(0.4) * Rx(0.18)
    // This combines a horizontal turn with a slight tilt
    R.value = mmul(mry(0.4), mrx(0.18));
  } else {
    // Fallback: identity matrix (no rotation)
    // This is a 4x4 matrix but only the 3x3 rotation part is used
    R.value = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
}
