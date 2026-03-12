'use strict';

// Shared globals for the wireframe engine
// Loaded first to ensure all modules have access to these

// Physics / rotation state
let R = null;  // rotation matrix - initialized in initRotation()
let wx = 0, wy = 0, wz = 0;
let frameCount = 0;
let dragging = false;
let AUTO_WX = 0.003, AUTO_WY = 0.002, AUTO_WZ = 0.001;
let AUTO_ROTATION = true;
let lx = 0, ly = 0;

// Model state
let MODEL = null;  // { V: [], F: [], E: [] }
let MODEL_CY = 0;
let Z_HALF = 1.0;
let ZOOM = 1.0;
let ZOOM_MIN = 0.45;
let ZOOM_MAX = 2.75;

// LOD
let GLOBAL_MIN_LOD_PERCENT = 5;
let BASE_MODEL = null;
let CURRENT_LOD_MODEL = null;
let CURRENT_LOD_VERTS = null;
let LOD_RANGE = { min: 3, max: 3 };
const MORPH_POINT_CAP = 300;
const MORPH_DURATION_MS = 1600;

// Rendering state
let W = 0, H = 0;
let ctx = null;
let canvas = null;
let bgCanvas = null;
let fgCanvas = null;
let fillLayerCanvas = null;
let fillLayerCtx = null;
let RENDER_FRAME_ID = 0;
let FILL_OPACITY = 0.35;
let WIRE_OPACITY = 0.85;

// Morphing state
let MORPH = null;

// Theme and lighting
let THEME = null;
let LIGHT_DIR = [0.5, 0.8, 0.6];
let VIEW_DIR = [0, 0, -1];

// Background particles
const BG_PARTICLES = [];
let BG_PARTICLE_DENSITY = 1;
let BG_PARTICLE_DENSITY_TARGET = 1;
let BG_PARTICLE_VELOCITY = 1;
let BG_PARTICLE_VELOCITY_TARGET = 1;
let BG_PARTICLE_OPACITY = 1;
let BG_PARTICLE_OPACITY_TARGET = 1;

// Loop/telemetry
let cpuForegroundDrawnOnMainCanvas = false;
let gpuSceneDrawnLastFrame = false;
let foregroundRenderMode = 'unknown';
const MAX_FPS = 0;
const MIN_FRAME_INTERVAL_MS = MAX_FPS > 0 ? (1000 / MAX_FPS) : 0;
let lastFrameMs = -1;
let telemetryLastUiMs = 0;
const TELEMETRY_UI_INTERVAL_MS = 250;
let lastPresentedFrameMs = -1;
let emaFrameMs = 0;
let emaFpsFrameIntervalMs = 0;
let emaPhysMs = 0;
let emaBgMs = 0;
let emaFgMs = 0;
const TELEMETRY_ALPHA = 0.2;
let HOLD_ROTATION_FRAMES = 0;


// Telemetry DOM elements (optional - may not exist)
let statFps = null;
let statFrameMs = null;
let statPhysMs = null;
let statBgMs = null;
let statFgMs = null;
let statRenderer = null;
let statV = null;
let statE = null;

// Initialize rotation matrix with default orientation
function initRotation() {
  if (typeof mry === 'function' && typeof mrx === 'function' && typeof mmul === 'function') {
    R = mmul(mry(0.4), mrx(0.18));
  } else {
    // Fallback: identity matrix
    R = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
}
