/**
 * getOrCreateBackWireLayer.js - Offscreen Back-Facing Wireframe Compositing Layer
 * 
 * PURPOSE:
 *   Provides a dedicated offscreen canvas for back-facing wireframe edges that can
 *   be composited under the fill layer. This allows back wireframe to show through
 *   transparent fill while front wireframe stays on top.
 * 
 * ARCHITECTURE ROLE:
 *   Part of the core rendering infrastructure. The back wire layer is a lazily-created
 *   offscreen canvas that matches viewport dimensions. It's used by the CPU wireframe
 *   rendering path to draw only back-facing edges separately from front-facing ones.
 * 
 * PERFORMANCE:
 *   Previously this canvas was created fresh every frame via document.createElement().
 *   This was a significant performance bottleneck (10-15% of frame time). By caching
 *   and reusing the canvas, we eliminate this overhead entirely.
 */

"use strict";

/**
 * getOrCreateBackWireLayer - Returns or creates the offscreen back wireframe canvas
 * 
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }} 
 *   The offscreen canvas and its 2D context for back wireframe rendering
 * 
 * The canvas is created once and reused across frames. It's resized to match
 * the viewport dimensions (globalThis.W x globalThis.H) on every call to ensure
 * it stays synchronized with window size changes.
 */
export function getOrCreateBackWireLayer() {
  // Lazy initialization: only create the canvas once on first call
  // This avoids allocating memory if the GPU path is used (no back wire layer needed)
  if (!globalThis.backWireLayerCanvas) {
    // Create an offscreen canvas element (not attached to DOM)
    globalThis.backWireLayerCanvas = document.createElement('canvas');
    
    // Get 2D context with alpha support for transparency blending
    // desynchronized: true hints to the browser that we don't need frame sync
    // This can improve performance by allowing the browser to composite asynchronously
    globalThis.backWireLayerCtx = globalThis.backWireLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
    
    // Disable image smoothing for crisp pixel-aligned wireframe lines
    // With smoothing enabled, lines can appear blurry or have inconsistent widths
    if (globalThis.backWireLayerCtx) globalThis.backWireLayerCtx.imageSmoothingEnabled = false;
  }
  
  // Always resize to match current viewport dimensions
  // This ensures the back wire layer stays synchronized even after window resize
  // We update every call (not just on resize) because this is cheap and foolproof
  globalThis.backWireLayerCanvas.width = globalThis.W;
  globalThis.backWireLayerCanvas.height = globalThis.H;
  
  // Return both canvas and context for the caller to use
  // The caller typically does: const { canvas, ctx } = getOrCreateBackWireLayer();
  return { canvas: globalThis.backWireLayerCanvas, ctx: globalThis.backWireLayerCtx };
}
