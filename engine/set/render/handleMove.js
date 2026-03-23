/**
 * onMove.js - Pointer Movement Handler
 *
 * PURPOSE:
 *   Handles pointer movement (mouse or touch) and converts it into rotation
 *   velocities. This is the core input-to-physics translation function that
 *   makes the model respond to user dragging.
 *
 * ARCHITECTURE ROLE:
 *   Called by attachInputListeners for both mouse and touch move events.
 *   Updates angular velocities via physicsState setters based on pointer delta.
 *
 * ROTATION MAPPING:
 *   - Horizontal drag (dx) → Y axis rotation (yaw)
 *   - Vertical drag (dy) → X axis rotation (pitch)
 *   - The 0.007 factor controls sensitivity
 */

"use strict";

import {
  isDragging, getLastPointerX, getLastPointerY,
  setWx, setWy, setLastPointerX, setLastPointerY,
} from '@engine/state/render/physicsState.js';

/**
 * onMove - Handles pointer movement for model rotation.
 *
 * @param {number} cx - Current pointer X position (clientX)
 * @param {number} cy - Current pointer Y position (clientY)
 * @returns {void}
 */
export function handleMove(cx, cy) {
  // Skip if not dragging
  if (!isDragging()) return;

  // Get previous pointer position (fallback to current if not set)
  const prevX = getLastPointerX();
  const prevY = getLastPointerY();
  const px = typeof prevX === 'number' ? prevX : cx;
  const py = typeof prevY === 'number' ? prevY : cy;

  // Calculate pointer delta
  const dx = cx - px, dy = cy - py;

  // Convert delta to angular velocities
  // Horizontal → Y rotation (yaw), Vertical → X rotation (pitch)
  setWy(dx * 0.007);
  setWx(dy * 0.007);

  // Store current position for next frame
  setLastPointerX(cx);
  setLastPointerY(cy);
}
