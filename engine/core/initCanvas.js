/**
 * initCanvas.js - Canvas Initialization and Viewport Synchronization
 * 
 * PURPOSE:
 *   Initializes all canvas elements used by the rendering pipeline and sets up
 *   viewport synchronization. This module establishes the global canvas references
 *   (ctx, fgCanvas, fillLayerCanvas) that other rendering modules depend on.
 * 
 * ARCHITECTURE ROLE:
 *   Must be imported early in the engine bootstrap sequence, before any rendering
 *   module that relies on canvas globals. It sets up three canvas layers:
 *   - bg (background): Particle effects layer
 *   - fg (foreground): Primary drawing surface for wireframe/fill
 *   - c (cpu): Legacy/fallback canvas, also used for offscreen operations
 *   Plus an offscreen fillLayerCanvas for compositing fill passes.
 * 
 * CANVAS LAYER STACK:
 *   The HTML has three stacked canvases with CSS z-index ordering:
 *   bg (bottom) -> c (middle) -> fg (top)
 *   This allows background particles to show through transparent foreground areas.
 */

// Import background state to wire up the background canvas reference
// This coupling is necessary because the background renderer needs direct canvas access
import { bgState } from '../render/background/backgroundState.js';

/**
 * initCanvas - Initializes canvas elements and sets up resize handling
 * 
 * This function:
 * 1. Grabs canvas elements from the DOM by their IDs
 * 2. Creates 2D rendering contexts for each
 * 3. Creates an offscreen canvas for fill layer compositing
 * 4. Sets up a resize listener to keep all canvases synchronized with viewport
 * 5. Wires up the background state with its canvas reference
 * 
 * @returns {void} Nothing - results are stored in globalThis properties
 */
export function initCanvas() {
  // Guard: skip initialization if running in a non-browser environment (SSR, Node, etc.)
  // This allows the module to be imported safely in any context
  if (typeof document === 'undefined') return;

  // Grab the CPU canvas element - this is the original canvas, now used for offscreen ops
  // The 'c' id is kept for backward compatibility with existing HTML
  const cpuCanvas = document.getElementById('c');
  
  // Grab the foreground canvas - this is the primary drawing surface for CPU rendering
  // It's positioned on top of other canvases via CSS z-index
  globalThis.fgCanvas = document.getElementById('fg');
  
  // Grab the GPU canvas - dedicated canvas for WebGL rendering
  // This is separate from fgCanvas because a canvas can only have one context type
  globalThis.gpuCanvas = document.getElementById('gpu');
  
  // Get the 2D rendering context from the foreground canvas
  // This becomes the primary ctx that most CPU rendering code uses
  globalThis.ctx = globalThis.fgCanvas ? globalThis.fgCanvas.getContext('2d') : null;
  
  // Fallback: if fg canvas isn't available, use the cpu canvas as primary context
  // This handles edge cases where the HTML might not have all three canvases
  if (!globalThis.ctx) {
    console.warn('[initCanvas] fg context not available, falling back to cpu');
    globalThis.ctx = cpuCanvas ? cpuCanvas.getContext('2d') : null;
  }
  
  // Create an offscreen canvas for fill-layer rendering
  // This is used to draw solid fills separately from wireframes, enabling:
  // - Independent opacity control
  // - Compositing without alpha seam artifacts
  // - Multi-pass rendering techniques
  globalThis.fillLayerCanvas = document.createElement('canvas');
  globalThis.fillLayerCtx = globalThis.fillLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
  
  // Disable image smoothing on the fill layer for consistent rendering
  // This prevents subtle blurring at triangle edges during compositing
  if (globalThis.fillLayerCtx) globalThis.fillLayerCtx.imageSmoothingEnabled = false;

  /**
   * syncSize - Synchronizes all canvas dimensions with the current viewport
   * 
   * Called on initial load and whenever the window is resized. Ensures all
   * canvases have matching dimensions so layers composite correctly.
   */
  function syncSize() {
    // Read current viewport dimensions
    const w = globalThis.innerWidth;
    const h = globalThis.innerHeight;
    
    // Store dimensions globally so other modules can access them without DOM queries
    // This is used by projection math, particle systems, and rendering bounds
    globalThis.W = w;
    globalThis.H = h;
    
    // Resize the CPU canvas to match viewport
    if (cpuCanvas) {
      cpuCanvas.width = w;
      cpuCanvas.height = h;
    }
    
    // Resize the background canvas
    const bgCanvas = document.getElementById('bg');
    if (bgCanvas) {
      bgCanvas.width = w;
      bgCanvas.height = h;
    }
    
    // Resize the foreground canvas (primary drawing surface for CPU rendering)
    if (globalThis.fgCanvas) {
      globalThis.fgCanvas.width = w;
      globalThis.fgCanvas.height = h;
    }
    
    // Resize the GPU canvas (dedicated WebGL rendering surface)
    if (globalThis.gpuCanvas) {
      globalThis.gpuCanvas.width = w;
      globalThis.gpuCanvas.height = h;
    }
    
    // Resize the offscreen fill layer canvas
    if (globalThis.fillLayerCanvas) {
      globalThis.fillLayerCanvas.width = w;
      globalThis.fillLayerCanvas.height = h;
    }
    
    // Log for debugging - helps diagnose viewport sync issues
    console.debug('[initCanvas] synced canvas sizes', w, h);
  }
  
  // Set up resize handling only in browser environments
  // The typeof checks guard against non-browser contexts
  if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
    // Perform initial sync immediately
    syncSize();
    
    // Listen for window resize events to keep canvases synchronized
    // We use two separate listeners for clarity, though they could be combined
    globalThis.addEventListener('resize', syncSize);
    
    // Also update the global W/H values on resize
    // This is redundant with syncSize but ensures globals are always current
    // even if syncSize is called from other contexts
    globalThis.addEventListener('resize', () => {
      globalThis.W = globalThis.innerWidth;
      globalThis.H = globalThis.innerHeight;
    });
  }

  // Wire up the background canvas reference to the background renderer state
  // The background particle system needs direct canvas access for efficient rendering
  // We wrap in try/catch because bgState might not be initialized in all configurations
  try {
    const bgCanvas = document.getElementById('bg');
    if (bgCanvas) {
      bgState.canvas = bgCanvas;
    }
  } catch (err) {
    // Non-fatal: background rendering will fall back to alternative methods
    console.warn('[initCanvas] failed to locate bg canvas', err);
  }
}

// Default export for convenience - allows import initCanvas from './initCanvas.js'
export default initCanvas;
