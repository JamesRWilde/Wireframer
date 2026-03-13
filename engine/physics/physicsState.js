// Physics and input state exposed on globalThis to allow simple global access
if (!globalThis.PHYSICS_STATE) {
	globalThis.PHYSICS_STATE = {
		wx: 0,
		wy: 0,
		wz: 0,
		AUTO_WX: 0.01,   // slower auto-pitch
		AUTO_WY: 0.015,  // slower auto-yaw
		AUTO_WZ: 0.0025, // slight roll
		R: null, // rotation matrix - initialized by initializeRotation()
		dragging: false,
		HOLD_ROTATION_FRAMES: 0,
	};
}

// Note: getter/setter functions are not permitted — use `globalThis.PHYSICS_STATE` directly.

// Helpers
export function decrementHoldRotationFrames() {
  if (globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES > 0) globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES--;
}

// Do not expose trivial getters — consumers should read `globalThis.PHYSICS_STATE` directly.

