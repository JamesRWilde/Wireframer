/**
 * getRotationInit.js - Initial Rotation Matrix Setup
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
 * WHY THIS EXISTS:
 *   Provides a deterministic startup orientation and makes it easy to change
 *   initial model presentation in one location.
 * 
 * WHY THESE ANGLES:
 *   The combination of 0.4 radians (~23°) Y rotation and 0.18 radians (~10°)
 *   X rotation gives a slightly tilted, three-quarter view that showcases
 *   the model's depth and form.
 */

"use strict";

// Import matrix multiplication for combining rotations
import { utilMatrixMultiply3x3 }from '@engine/util/render/utilMatrixMultiply3x3.js';

// Import Y-axis rotation matrix constructor
import { utilMatrixY }from '@engine/util/render/rotation/utilMatrixY.js';

// Import X-axis rotation matrix constructor
import { utilMatrixX }from '@engine/util/render/rotation/utilMatrixX.js';

// Import the global rotation matrix reference
import {R} from '@engine/state/render/stateRotationMatrixRef.js';

/**
 * rotationInitialize - Sets up the initial rotation matrix
 * 
 * Creates a rotation matrix that combines:
 * - 0.4 radians rotation around Y axis (horizontal turn)
 * - 0.18 radians rotation around X axis (slight tilt)
 * 
 * This gives a pleasing three-quarter view of the model.
 * Falls back to identity matrix if rotation functions aren't available.
 */
export function getRotationInit() {
  R.value = utilMatrixMultiply3x3(utilMatrixY(0.4), utilMatrixX(0.18));
}
