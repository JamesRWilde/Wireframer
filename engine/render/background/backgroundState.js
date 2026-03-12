// Background renderer state
export const BG_GPU_MAX_FPS = 60;
export const BG_GPU_MIN_INTERVAL_MS = 1000 / BG_GPU_MAX_FPS;

export const bgState = {
	renderer: null,
	rendererFailed: false,
	gpuLastRenderMs: -1,
	canvas: null,
};

// Note: consumers should import `bgState` and read/write properties directly.
