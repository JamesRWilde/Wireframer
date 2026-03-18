/**
 * attachInputListeners.js - Mouse and Touch Input Handler Setup
 *
 * PURPOSE:
 *   Attaches mouse and touch event listeners to the canvas for interactive
 *   model rotation and zoom. Translates user gestures into physics state
 *   changes via the physicsState module.
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

import { onMove } from '@engine/set/render/onMove.js';
import {
  setDragging, setLastPointerX, setLastPointerY,
  setWx, setWy,
} from '@engine/state/render/physicsState.js';

/**
 * attachInputListeners - Attaches input event listeners to canvas.
 *
 * Clones the canvas to remove any previous listeners, then attaches
 * mouse, touch, and wheel event handlers for model interaction.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to attach listeners to
 * @returns {void}
 */
export function attachInputListeners(canvas) {
  if (!canvas) return;

  // Remove any previous listeners by cloning the node
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(newCanvas, canvas);
  canvas = newCanvas;

  // Mouse down: start dragging
  canvas.addEventListener('mousedown', e => {
    setDragging(true);
    setLastPointerX(e.clientX);
    setLastPointerY(e.clientY);
    setWx(0);
    setWy(0);
  });

  // Mouse up: stop dragging (on window to catch releases outside canvas)
  globalThis.addEventListener('mouseup', () => {
    setDragging(false);
  });

  // Mouse move: update rotation based on drag delta
  globalThis.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));

  // Touch start: start dragging (mobile)
  canvas.addEventListener('touchstart', e => {
    setDragging(true);
    setLastPointerX(e.touches[0].clientX);
    setLastPointerY(e.touches[0].clientY);
    setWx(0);
    setWy(0);
  }, { passive: true });

  // Touch end: stop dragging (mobile)
  canvas.addEventListener('touchend', () => {
    setDragging(false);
  });

  // Touch move: update rotation based on drag delta (mobile)
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  // Wheel: zoom in/out
  canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0012);
    globalThis.ZOOM = Math.max(globalThis.ZOOM_MIN, Math.min(globalThis.ZOOM_MAX, globalThis.ZOOM * factor));
  }, { passive: false });

  // Expose canvas reference for other modules if needed
  globalThis._inputCanvas = canvas;
}
