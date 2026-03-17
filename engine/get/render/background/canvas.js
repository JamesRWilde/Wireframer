/**
 * getBackgroundCanvas.js - Background Canvas Accessor
 * 
 * PURPOSE:
 *   Returns the background canvas element along with its 2D context and
 *   current dimensions. This provides a normalized interface for background
 *   rendering code that needs canvas access.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawBackground to get the canvas for rendering. Centralizes
 *   canvas access and dimension synchronization.
 * 
 * WHY SYNCHRONIZE DIMENSIONS:
 *   Canvas pixel dimensions must match CSS dimensions for crisp rendering.
 *   We update width/height from clientWidth/clientHeight each frame to
 *   handle window resizing automatically.
 */

// Import background state for canvas reference
from '@engine/state/render/background/backgroundState.js';

/**
 * getBackgroundCanvas - Gets background canvas with context and dimensions
 * 
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, w: number, h: number }|null}
 *   Canvas element, 2D context, width, and height, or null if unavailable
 * 
 * The function:
 * 1. Gets canvas from background state
 * 2. Gets 2D context
 * 3. Synchronizes dimensions from CSS to pixel size
 * 4. Returns all values or null if unavailable
 */
export function canvas() {
  // Get canvas from background state
  const canvas = bgState.canvas;
  if (!canvas) return null;

  // Get 2D rendering context
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Synchronize canvas dimensions with CSS dimensions
  // clientWidth/clientHeight reflect the actual displayed size
  // We assign back to width/height to resize the pixel buffer
  const w = (canvas.width = canvas.clientWidth || canvas.width);
  const h = (canvas.height = canvas.clientHeight || canvas.height);
  
  return { canvas, ctx, w, h };
}
