/**
 * morphState.js - Morph Animation State
 *
 * PURPOSE:
 *   Defines the shared state object for 3-phase morphing operations.
 *
 * STATE PROPERTIES:
 *   - active: Whether a morph is currently in progress
 *   - startTime: Timestamp when the morph started
 *   - duration: Total duration of the morph in milliseconds
 *   - fromMesh: Original source mesh (cloned)
 *   - toMesh: Original target mesh (cloned)
 *   - fromDecimated: Source mesh decimated to low detail (for Phase 1 & 2)
 *   - toDecimated: Target mesh decimated to low detail (for Phase 2 & 3)
 *   - morphMap: Precomputed nearest-vertex mapping { indices, tx, ty, tz }
 *   - currentMesh: Current interpolated mesh (updated each frame)
 *   - progress: Current progress through the morph (0-1)
 *   - onComplete: Callback to invoke when morph completes
 *   - startZoom: Zoom level at morph start
 */

"use strict";

export const morphState = {
  active: false,
  startTime: 0,
  duration: 0,
  fromMesh: null,
  toMesh: null,
  fromDecimated: null,
  toDecimated: null,
  morphMap: null,
  currentMesh: null,
  progress: 0,
  onComplete: null,
  startZoom: 1,
  targetZoom: 1,
};
