/**
 * R.js - Global Rotation Matrix Reference
 * 
 * PURPOSE:
 *   Provides a shared reference to the global rotation matrix used throughout
 *   the application. This is the single source of truth for the model's current
 *   orientation.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by physics, rendering, and initialization code that needs to read
 *   or modify the rotation matrix. The object wrapper allows the matrix to be
 *   replaced while maintaining references.
 * 
 * WHY OBJECT WRAPPER:
 *   Using { value: null } instead of exporting the matrix directly allows
 *   the matrix to be replaced (e.g., during initialization) while all importers
 *   see the update. If we exported the array directly, importers would have
 *   stale references after reassignment.
 */

"use strict";

/**
 * R - Global rotation matrix reference
 * 
 * @property {Array<number>|null} value - The current 3x3 rotation matrix
 *   as a flat 9-element array, or null if not yet initialized
 * 
 * Usage:
 *   from '@engine/state/render/stateRotationMatrixRef.js';
 *   const matrix = R.value;  // Read the current matrix
 *   R.value = newMatrix;     // Replace the matrix
 */
export const R = { value: null };
