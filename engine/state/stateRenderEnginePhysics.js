/**
 * physicsState.js - Physics and Input State Initialization
 * 
 * PURPOSE:
 *   Initializes the global physics state object that tracks rotation velocities,
 *   auto-rotation settings, and input state. This is the central state hub for
 *   all rotation-related physics in the application.
 * 
 * ARCHITECTURE ROLE:
 *   Imported early during engine bootstrap (before the frame loop starts) to
 *   ensure PHYSICS_STATE is available when SetEnginePhysics and input handlers
 *   need it. The state is exposed globally for simple access throughout the app.
 * 
 * STATE PROPERTIES:
 *   - wx, wy, wz: Current angular velocities (radians per frame)
 *   - AUTO_WX, AUTO_WY, AUTO_WZ: Target velocities for auto-rotation
 *   - R: Rotation matrix (initialized by rotationInitialize)
 *   - dragging: Whether user is currently dragging
 *   - HOLD_ROTATION_FRAMES: Frames to pause rotation (for interaction)
 * 
 * WHY GLOBAL:
 *   The physics state is accessed by many modules (input handlers, physics
 *   update, rendering). Exposing it globally avoids circular imports and
 *   simplifies the codebase.
 */

"use strict";

// Initialize PHYSICS_STATE if it doesn't already exist
// This guard allows the module to be imported multiple times safely
if (!globalThis.PHYSICS_STATE) {
	globalThis.PHYSICS_STATE = {
		// Current angular velocities (radians per frame)
		// These are updated by input handlers and physics update
		wx: 0,  // Rotation around X axis (pitch)
		wy: 0,  // Rotation around Y axis (yaw)
		wz: 0,  // Rotation around Z axis (roll)
		
		// Auto-rotation target velocities
		// When not dragging, velocities ease toward these values
		AUTO_WX: 0.01,   // Slower auto-pitch (gentle nod)
		AUTO_WY: 0.015,  // Slower auto-yaw (gentle turn)
		AUTO_WZ: 0.0025, // Slight roll (subtle tilt)
		
		// Rotation matrix - initialized by rotationInitialize()
		// This is the 3x3 matrix that transforms vertices
		R: null,
		
		// Whether user is currently dragging (mouse/touch down)
		// Used by physics update to apply friction vs auto-rotation
		dragging: false,
		
		// Frames to pause rotation (for interaction feedback)
		// Decremented each frame, rotation pauses while > 0
		HOLD_ROTATION_FRAMES: 0,
	};
}

// Note: getter/setter functions are not permitted — use `globalThis.PHYSICS_STATE` directly.
// This follows the project's convention of accessing state directly rather than
// through accessor functions, reducing boilerplate and improving performance.

/**
 * decrementHoldRotationFrames - Decrements the rotation hold counter
 * 
 * This helper function decrements the HOLD_ROTATION_FRAMES counter if it's
 * greater than zero. When the counter is positive, rotation is paused to
 * provide visual feedback during user interaction.
 */
export function stateRenderEnginePhysics() {
  if (globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES > 0) globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES--;
}

// Do not expose trivial getters — consumers should read `globalThis.PHYSICS_STATE` directly.

