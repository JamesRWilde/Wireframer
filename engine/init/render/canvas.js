/**
 * canvas.js - Canvas and Rendering Context Initialization
 *
 * PURPOSE:
 *   Initializes all canvas elements (CPU foreground, GPU, background, fill layer)
 *   and their 2D/WebGL rendering contexts. Sets up window resize handling
 *   to keep all canvases synchronized with the viewport.
 *
 * ARCHITECTURE ROLE:
 *   Called early in the engine initialization sequence. Establishes the
 *   rendering surface for both CPU and GPU render paths. Stores references
 *   on globalThis for cross-module access.
 *
 * SIDE EFFECTS:
 *   - Creates a new fillLayerCanvas element
 *   - Stores canvas/context references on globalThis
 *   - Adds window resize event listeners
 */

"use strict";

// Import background render state to locate the background canvas
import {bgState} from '@engine/state/render/background/backgroundState.js';

// Canvas context setter/getter for the primary 2D draw context
import { setCanvasCtx } from '@engine/set/render/setCanvasCtx.js';
import { getCanvasCtx } from '@engine/get/render/getCanvasCtx.js';

// Canvas element getters/setters
import { setFgCanvas } from '@engine/set/render/setFgCanvas.js';
import { setGpuCanvas } from '@engine/set/render/setGpuCanvas.js';
import { getFgCanvas } from '@engine/get/render/getFgCanvas.js';
import { setFillLayerCanvas } from '@engine/set/render/setFillLayerCanvas.js';
import { setFillLayerCtx } from '@engine/set/render/setFillLayerCtx.js';
import { getFillLayerCanvas } from '@engine/get/render/getFillLayerCanvas.js';
import { getFillLayerCtx } from '@engine/get/render/getFillLayerCtx.js';

// Import canvas size synchronization to keep all canvases in sync
import { syncCanvasSize }from '@engine/set/render/syncCanvasSize.js';
import { setW, setH } from '@engine/state/render/viewportState.js';

/**
 * canvas - Initializes all canvas elements and rendering contexts
 *
 * @returns {void}
 */
export function canvas() {
  // Guard against non-browser environments (SSR, Node)
  if (typeof document === 'undefined') return;

  // Get the CPU canvas (primary fallback rendering surface)
  const cpuCanvas = document.getElementById('c');

  // Store canvas element references in shared state
  setFgCanvas(document.getElementById('fg'));
  setGpuCanvas(document.getElementById('gpu'));

  // Get the 2D context from the foreground canvas
  setCanvasCtx(getFgCanvas() ? getFgCanvas().getContext('2d') : null);

  // Fallback: use CPU canvas if foreground context is unavailable
  if (!getCanvasCtx()) {
    console.warn('[initCanvas] fg context not available, falling back to cpu');
    setCanvasCtx(cpuCanvas ? cpuCanvas.getContext('2d') : null);
  }

  // Create a dedicated fill layer canvas for triangle fill rendering
  // Uses alpha channel and desynchronized hint for performance
  setFillLayerCanvas(document.createElement('canvas'));
  setFillLayerCtx(getFillLayerCanvas().getContext('2d', { alpha: true, desynchronized: false }));

  // Disable image smoothing for pixel-accurate triangle rendering
  if (getFillLayerCtx()) getFillLayerCtx().imageSmoothingEnabled = false;

  // Sync canvas sizes and set up resize listeners
  if (typeof window !== 'undefined' && window.addEventListener) {
    syncCanvasSize(cpuCanvas);

    // On resize, synchronize all canvas dimensions to viewport size
    window.addEventListener('resize', () => syncCanvasSize(cpuCanvas));
    window.addEventListener('resize', () => {
      setW(window.innerWidth);
      setH(window.innerHeight);
    });
  }

  // Locate and store the background canvas for particle rendering
  try {
    const bgCanvas = document.getElementById('bg');
    if (bgCanvas) {
      bgState.canvas = bgCanvas;
    }
  } catch (err) {
    console.warn('[initCanvas] failed to locate bg canvas', err);
  }
}

// Export as default for flexible import styles
export default canvas;
