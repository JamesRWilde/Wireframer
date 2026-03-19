/**
 * debugOverlay.js - Telemetry Debug Overlay
 *
 * PURPOSE:
 *   Updates and displays telemetry metrics such as FPS, frame timings, and renderer info.
 *
 * ARCHITECTURE ROLE:
 *   Called during the render loop to update performance metrics on the UI.
 */

"use strict";

/**
 * updateDebugOverlay - Updates telemetry metrics on the debug overlay
 *
 * @param {Object} metrics - Performance metrics to display
 * @param {number} metrics.fps - Frames per second
 * @param {number} metrics.frameMs - Frame time in milliseconds
 * @param {string} metrics.renderer - Renderer information
 */
export function updateDebugOverlay({ fps, frameMs, renderer }) {
  const fpsElement = document.querySelector('[ref=e62]');
  const frameMsElement = document.querySelector('[ref=e64]');
  const rendererElement = document.querySelector('[ref=e60]');

  if (fpsElement) fpsElement.innerText = fps.toFixed(1);
  if (frameMsElement) frameMsElement.innerText = frameMs.toFixed(1);
  if (rendererElement) rendererElement.innerText = renderer;
}