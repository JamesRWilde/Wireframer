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

import { setHandleMove } from '@engine/set/render/setHandleMove.js';
import { setDragging, setLastPointerX, setLastPointerY, setWx, setWy } from '@engine/state/render/physicsState.js';
import { getZoom, getZoomMin, getZoomMax, setZoom } from '@engine/state/render/zoomState.js';
import { setInputCanvas } from '@engine/set/render/setInputCanvas.js';
import { getTouchDist } from '@engine/get/render/touch/getTouchDist.js';

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
  const appWindow = 'window' in globalThis ? globalThis.window : undefined;
  if (appWindow?.addEventListener) {
    appWindow.addEventListener('mouseup', () => {
      setDragging(false);
    });

    // Mouse move: update rotation based on drag delta
    appWindow.addEventListener('mousemove', e => setHandleMove(e.clientX, e.clientY));
  }

  // Pinch zoom state (two-finger gesture)
  let pinchStartDist = 0;
  let pinchStartZoom = 1;

  // Touch start: single-finger drag or two-finger pinch
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      // Two fingers: start pinch zoom, stop dragging
      setDragging(false);
      pinchStartDist = getTouchDist(e.touches[0], e.touches[1]);
      pinchStartZoom = getZoom();
    } else if (e.touches.length === 1) {
      // One finger: start dragging
      setDragging(true);
      setLastPointerX(e.touches[0].clientX);
      setLastPointerY(e.touches[0].clientY);
      setWx(0);
      setWy(0);
    }
  }, { passive: true });

  // Touch end: stop dragging
  canvas.addEventListener('touchend', () => {
    setDragging(false);
  });

  // Touch move: rotate (one finger) or pinch zoom (two fingers)
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchStartDist > 0) {
      const currentDist = getTouchDist(e.touches[0], e.touches[1]);
      const scale = currentDist / pinchStartDist;
      const newZoom = Math.max(getZoomMin(), Math.min(getZoomMax(), pinchStartZoom * scale));
      setZoom(newZoom);
    } else if (e.touches.length === 1) {
      setHandleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  // Wheel: zoom in/out
  canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0012);
    const newZoom = Math.max(getZoomMin(), Math.min(getZoomMax(), getZoom() * factor));
    setZoom(newZoom);
  }, { passive: false });

  // Store input canvas in shared state for other modules (no global object state)
  setInputCanvas(canvas);
}
