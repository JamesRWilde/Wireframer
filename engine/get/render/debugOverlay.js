/**
 * debugOverlay.js - Sphere & Centre Debug Visuals
 *
 * Draws a red circle (bounding sphere outline) and blue cross (screen centre)
 * on a 2D canvas overlay. Shows whether the sphere stays centred and constant
 * size throughout all actions (zoom, rotate, morph).
 *
 * Sphere is law — this overlay proves it.
 */

"use strict";

let overlay = null;
let ctx = null;
let _visible = false;

const SPHERE_COLOR = 'rgba(255, 40, 40, 0.7)';
const CROSS_COLOR = 'rgba(40, 80, 255, 0.8)';
const LINE_WIDTH = 1.5;

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

function resize() {
  if (!overlay) return;
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;
}

export function showDebugOverlay() {
  _visible = true;
  if (!overlay) initDebugOverlay();
  overlay.style.display = 'block';
  resize();
}

export function hideDebugOverlay() {
  _visible = false;
  if (overlay) overlay.style.display = 'none';
}

export function toggleDebugOverlay() {
  if (_visible) hideDebugOverlay();
  else showDebugOverlay();
  return _visible;
}

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
  const screenRadius = projFactor;  // sphere radius = 1, so screen radius = projFactor
  
  ctx.strokeStyle = SPHERE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(cx, cy, screenRadius, 0, Math.PI * 2);
  ctx.stroke();
}
