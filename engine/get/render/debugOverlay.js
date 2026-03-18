/**
 * debugOverlay.js - Sphere & Centre Debug Visuals
 *
 * PURPOSE:
 *   Draws a red circle (bounding sphere outline) and blue cross (screen centre)
 *   on a 2D canvas overlay. Provides visual verification that the sphere stays
 *   centred and constant size throughout all actions (zoom, rotate, morph).
 *
 * ARCHITECTURE ROLE:
 *   Called from the render loop after scene rendering to draw verification
 *   graphics on a separate 2D canvas layer. No interaction with WebGL shaders.
 *   The overlay canvas sits above the WebGL canvas with pointer-events: none.
 *
 * PARADIGM:
 *   "Sphere is law" — every mesh lives inside a unit bounding sphere (radius 1,
 *   centred at origin). This overlay proves the paradigm holds visually:
 *   - Red circle = bounding sphere outline (should always be constant size)
 *   - Blue cross = screen centre (sphere centre should always align with this)
 */

"use strict";

/** @type {HTMLCanvasElement|null} Overlay canvas element */
let overlay = null;

/** @type {CanvasRenderingContext2D|null} 2D drawing context */
let ctx = null;

/** @type {boolean} Current visibility state */
let _visible = false;

/** @type {string} RGBA colour for bounding sphere outline */
const SPHERE_COLOR = 'rgba(255, 40, 40, 0.7)';

/** @type {string} RGBA colour for screen centre cross */
const CROSS_COLOR = 'rgba(40, 80, 255, 0.8)';

/** @type {number} Line width in CSS pixels */
const LINE_WIDTH = 1.5;

/**
 * initDebugOverlay - Creates the overlay canvas and attaches it to the DOM.
 *
 * The canvas is fixed-position, full-viewport, with pointer-events disabled
 * so it doesn't interfere with mouse/touch interaction. Starts hidden;
 * call showDebugOverlay() or toggleDebugOverlay() to make visible.
 *
 * Exposed as globalThis.initDebugOverlay for external use.
 *
 * @returns {void}
 */
export function initDebugOverlay() {
  overlay = document.createElement('canvas');
  overlay.id = 'debug-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '100';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);
  ctx = overlay.getContext('2d');
}

/**
 * resize - Matches the overlay canvas resolution to the current viewport.
 *
 * Called before each render to handle window resize. Uses clientWidth/Height
 * to match CSS pixels. No-op if overlay hasn't been initialised.
 *
 * @returns {void}
 */
function resize() {
  if (!overlay) return;
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;
}

/**
 * showDebugOverlay - Makes the debug overlay visible and resizes it.
 *
 * Initialises the overlay on first call (lazy creation).
 *
 * @returns {void}
 */
export function showDebugOverlay() {
  _visible = true;
  if (!overlay) initDebugOverlay();
  overlay.style.display = 'block';
  resize();
}

/**
 * hideDebugOverlay - Hides the debug overlay without destroying it.
 *
 * @returns {void}
 */
export function hideDebugOverlay() {
  _visible = false;
  if (overlay) overlay.style.display = 'none';
}

/**
 * toggleDebugOverlay - Toggles debug overlay visibility.
 *
 * @returns {boolean} New visibility state (true = visible)
 *
 * Exposed as globalThis.toggleDebugOverlay for keyboard shortcut use.
 */
export function toggleDebugOverlay() {
  if (_visible) hideDebugOverlay();
  else showDebugOverlay();
  return _visible;
}

/**
 * renderDebugOverlay - Draws the sphere outline and centre cross.
 *
 * Called once per frame from the render loop (after scene rendering).
 * Early-returns if overlay is hidden or not initialised.
 *
 * Drawing:
 * - Blue cross: 20px crosshair at viewport centre (screen origin)
 * - Red circle: bounding sphere outline projected to screen space
 *
 * The sphere projects to a circle because orthographic projection with
 * constant zoom produces no perspective distortion. The screen radius is
 * calculated from the unit sphere (radius 1) using the current zoom level
 * and the viewport's minimum dimension.
 *
 * @returns {void}
 */
export function renderDebugOverlay() {
  if (!_visible || !ctx || !overlay) return;
  
  resize();
  const w = overlay.width;
  const h = overlay.height;
  ctx.clearRect(0, 0, w, h);
  
  // --- Blue cross at screen centre ---
  const cx = w / 2;
  const cy = h / 2;
  const crossSize = 20;
  
  ctx.strokeStyle = CROSS_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(cx - crossSize, cy);
  ctx.lineTo(cx + crossSize, cy);
  ctx.moveTo(cx, cy - crossSize);
  ctx.lineTo(cx, cy + crossSize);
  ctx.stroke();
  
  // --- Red circle: bounding sphere outline ---
  // In orthographic projection with constant zoom, the sphere projects
  // to a circle on screen. Radius = viewport_min_dimension / 2 (unit sphere
  // fills half the viewport based on targetFraction = 0.5).
  const minDim = Math.min(w, h);
  const zoom = globalThis.ZOOM || 0.2778;
  const projFactor = minDim * 0.9 * zoom;
  const screenRadius = projFactor;
  
  ctx.strokeStyle = SPHERE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(cx, cy, screenRadius, 0, Math.PI * 2);
  ctx.stroke();
}
