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
 *   Updates PHYSICS_STATE angular velocities based on pointer delta.
 * 
 * HOW IT WORKS:
 *   1. Check if user is currently dragging
 *   2. Calculate pointer delta from last position
 *   3. Convert delta to angular velocities
 *   4. Store current position for next frame
 * 
 * ROTATION MAPPING:
 *   - Horizontal drag (dx) → Y axis rotation (yaw)
 *   - Vertical drag (dy) → X axis rotation (pitch)
 *   - The 0.007 factor controls sensitivity
 */

"use strict";

/**
 * onMove - Handles pointer movement for model rotation
 * 
 * @param {number} cx - Current pointer X position (clientX)
 * @param {number} cy - Current pointer Y position (clientY)
 * 
 * This function:
 * 1. Returns immediately if not dragging
 * 2. Calculates delta from last pointer position
 * 3. Converts delta to angular velocities
 * 4. Updates last pointer position
 */
export function setRenderEngineOnMove(cx, cy) {
  // Skip if not dragging
  if (!globalThis.PHYSICS_STATE?.dragging) return;
  
  // Get previous pointer position (fallback to current if not set)
  const prevX = typeof globalThis.PHYSICS_STATE.lastPointerX === 'number' ? globalThis.PHYSICS_STATE.lastPointerX : cx;
  const prevY = typeof globalThis.PHYSICS_STATE.lastPointerY === 'number' ? globalThis.PHYSICS_STATE.lastPointerY : cy;
  
  // Calculate pointer delta
  const dx = cx - prevX, dy = cy - prevY;
  
  // Convert delta to angular velocities
  // Horizontal movement → Y rotation (yaw)
  // Vertical movement → X rotation (pitch)
  // 0.007 factor controls sensitivity
  globalThis.PHYSICS_STATE.wy = dx * 0.007;
  globalThis.PHYSICS_STATE.wx = dy * 0.007;
  
  // Store current position for next frame
  globalThis.PHYSICS_STATE.lastPointerX = cx;
  globalThis.PHYSICS_STATE.lastPointerY = cy;
}
