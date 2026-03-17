/**
 * morphState.js - Morph Animation State
 * 
 * PURPOSE:
 *   Defines the shared state object for morphing operations. This tracks
 *   the current morph animation's progress, source/target meshes, and
 *   completion callback.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by morphing functions that need to read or update morph state.
 *   The state object is mutable while the export binding is const.
 * 
 * STATE PROPERTIES:
 *   - active: Whether a morph is currently in progress
 *   - startTime: Timestamp when the morph started
 *   - duration: Total duration of the morph in milliseconds
 *   - fromMesh: Source mesh (where we're morphing from)
 *   - toMesh: Target mesh (where we're morphing to)
 *   - currentMesh: Current interpolated mesh (updated each frame)
 *   - progress: Current progress (0-1)
 *   - onComplete: Callback to invoke when morph completes
 */

"use strict";

/**
 * morphState - Shared mutable state for morphing operations
 * 
 * This object is imported and mutated directly by morphing modules.
 * Properties are initialized to sensible defaults.
 */
export const morphState = {
  // Whether a morph animation is currently active
  active: false,
  
  // Timestamp when the current morph started (from performance.now())
  startTime: 0,
  
  // Total duration of the morph in milliseconds
  duration: 0,
  
  // Source mesh (where we're morphing from)
  fromMesh: null,
  
  // Target mesh (where we're morphing to)
  toMesh: null,
  
  // Current interpolated mesh (updated each frame by advanceMorphFrame)
  currentMesh: null,
  
  // Current progress through the morph (0 = start, 1 = complete)
  progress: 0,
  
  // Callback to invoke when morph completes
  onComplete: null,
  
  // Zoom interpolation: starting and target zoom levels
  startZoom: 1,
  targetZoom: 1,
};
