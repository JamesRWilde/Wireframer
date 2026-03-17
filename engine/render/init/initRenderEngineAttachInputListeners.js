/**
 * attachInputListeners.js - Mouse and Touch Input Handler Setup
 * 
 * PURPOSE:
 *   Attaches mouse and touch event listeners to the canvas for interactive
 *   model rotation and zoom. This is the primary input handling module that
 *   translates user gestures into physics state changes.
 * 
 * ARCHITECTURE ROLE:
 *   Called by restoreStateAndAttachInput during app initialization. Sets up
 *   all input event handlers on the canvas element.
 * 
 * SUPPORTED INPUTS:
 *   - Mouse drag: Rotates the model
 *   - Mouse wheel: Zooms in/out
 *   - Touch drag: Rotates the model (mobile)
 *   - Ctrl+wheel: Browser zoom (passthrough)
 */

"use strict";

// Import the mouse/touch move handler
import { onMove } from ''../set/setRenderEngineOnMove.js'';

/**
 * attachInputListeners - Attaches input event listeners to canvas
 * 
 * @param {HTMLCanvasElement} canvas - The canvas element to attach listeners to
 * 
 * This function:
 * 1. Clones the canvas to remove any previous listeners
 * 2. Attaches mouse event handlers (mousedown, mouseup, mousemove)
 * 3. Attaches touch event handlers (touchstart, touchend, touchmove)
 * 4. Attaches wheel event handler for zoom
 */
export function initRenderEngineAttachInputListeners(canvas) {
  // Guard: return if canvas doesn't exist
  if (!canvas) return;
  
  // Remove any previous listeners by cloning the node
  // This is a safe way to remove all event listeners at once
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(newCanvas, canvas);
  canvas = newCanvas;

  // Mouse down: Start dragging
  canvas.addEventListener('mousedown', e => {
    // Ensure we have a full physics state object
    // Most modules import physicsState.js which creates one, but be defensive
    if (!globalThis.PHYSICS_STATE) {
      globalThis.PHYSICS_STATE = {
        wx:0, wy:0, wz:0,
        AUTO_WX:0.01, AUTO_WY:0.015, AUTO_WZ:0.0025,
        R: null,
        dragging: false,
        HOLD_ROTATION_FRAMES: 0,
      };
    }
    
    // Mark as dragging and store initial pointer position
    globalThis.PHYSICS_STATE.dragging = true;
    globalThis.PHYSICS_STATE.lastPointerX = e.clientX;
    globalThis.PHYSICS_STATE.lastPointerY = e.clientY;
    
    // Reset angular velocities so drag takes over immediately
    globalThis.PHYSICS_STATE.wx = 0;
    globalThis.PHYSICS_STATE.wy = 0;
  });

  // Mouse up: Stop dragging (attached to window to catch releases outside canvas)
  globalThis.addEventListener('mouseup', () => {
    if (globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE.dragging = false;
  });

  // Mouse move: Update rotation based on drag delta
  globalThis.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));

  // Touch start: Start dragging (mobile)
  canvas.addEventListener('touchstart', e => {
    if (!globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE = {};
    globalThis.PHYSICS_STATE.dragging = true;
    globalThis.PHYSICS_STATE.lastPointerX = e.touches[0].clientX;
    globalThis.PHYSICS_STATE.lastPointerY = e.touches[0].clientY;
    globalThis.PHYSICS_STATE.wx = 0;
    globalThis.PHYSICS_STATE.wy = 0;
  }, { passive: true });

  // Touch end: Stop dragging (mobile)
  canvas.addEventListener('touchend', () => {
    if (globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE.dragging = false;
  });

  // Touch move: Update rotation based on drag delta (mobile)
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();  // Prevent scrolling while dragging model
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  // Wheel: Zoom in/out
  canvas.addEventListener('wheel', (e) => {
    // Let Ctrl+wheel keep browser/page zoom behavior
    if (e.ctrlKey) return;
    
    e.preventDefault();
    
    // Calculate zoom factor from wheel delta
    // Exponential scaling provides smooth zoom feel
    const factor = Math.exp(-e.deltaY * 0.0012);
    
    // Apply zoom with clamping to valid range
    globalThis.ZOOM = Math.max(globalThis.ZOOM_MIN, Math.min(globalThis.ZOOM_MAX, globalThis.ZOOM * factor));
  }, { passive: false });

  // Expose canvas reference for other modules if needed
  globalThis._inputCanvas = canvas;
}
