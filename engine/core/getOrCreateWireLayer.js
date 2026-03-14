/**
 * getOrCreateWireLayer.js - Offscreen Wireframe Compositing Layer
 * 
 * PURPOSE:
 *   Provides a dedicated offscreen canvas for wireframe rendering that can be
 *   composited onto the main display. This separation allows wireframe lines
 *   to be rendered with different blending modes or opacity than the fill layer,
 *   and enables techniques like glow effects that require multiple passes.
 * 
 * ARCHITECTURE ROLE:
 *   Part of the core rendering infrastructure. The wire layer is a lazily-created
 *   offscreen canvas that matches viewport dimensions. It's used by the CPU
 *   wireframe rendering path to draw lines without interfering with the fill layer.
 * 
 * WHY OFFSCREEN:
 *   - Allows independent opacity control for wireframe vs fill
 *   - Enables multi-pass effects (glow, bloom) without redrawing the fill
 *   - Prevents alpha blending artifacts between fill and wire passes
 *   - Can be cleared independently each frame without affecting other layers
 */

"use strict";

/**
 * getOrCreateWireLayer - Returns or creates the offscreen wireframe canvas
 * 
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }} 
 *   The offscreen canvas and its 2D context for wireframe rendering
 * 
 * The canvas is created once and reused across frames. It's resized to match
 * the viewport dimensions (globalThis.W x globalThis.H) on every call to ensure
 * it stays synchronized with window size changes.
 */
export function getOrCreateWireLayer() {
  // Lazy initialization: only create the canvas once on first call
  // This avoids allocating memory if the GPU path is used (no wire layer needed)
  if (!globalThis.wireLayerCanvas) {
    // Create an offscreen canvas element (not attached to DOM)
    globalThis.wireLayerCanvas = document.createElement('canvas');
    
    // Get 2D context with alpha support for transparency blending
    // desynchronized: true hints to the browser that we don't need frame sync
    // This can improve performance by allowing the browser to composite asynchronously
    globalThis.wireLayerCtx = globalThis.wireLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
    
    // Disable image smoothing for crisp pixel-aligned wireframe lines
    // With smoothing enabled, lines can appear blurry or have inconsistent widths
    if (globalThis.wireLayerCtx) globalThis.wireLayerCtx.imageSmoothingEnabled = false;
  }
  
  // Always resize to match current viewport dimensions
  // This ensures the wire layer stays synchronized even after window resize
  // We update every call (not just on resize) because this is cheap and foolproof
  globalThis.wireLayerCanvas.width = globalThis.W;
  globalThis.wireLayerCanvas.height = globalThis.H;
  
  // Return both canvas and context for the caller to use
  // The caller typically does: const { canvas, ctx } = getOrCreateWireLayer();
  return { canvas: globalThis.wireLayerCanvas, ctx: globalThis.wireLayerCtx };
}
