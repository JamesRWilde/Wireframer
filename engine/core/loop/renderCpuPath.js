/**
 * renderCpuPath.js - CPU (Canvas 2D) Foreground Rendering Path
 * 
 * PURPOSE:
 *   Implements the CPU-based rendering path for the 3D model. This path uses
 *   Canvas 2D for all rendering operations and serves as the fallback when
 *   GPU (WebGL) rendering is unavailable or fails.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the frame loop when foregroundRenderMode is 'cpu'. Handles the
 *   complete rendering pipeline: clearing canvases, drawing solid fills,
 *   drawing wireframes, and compositing layers with proper opacity blending.
 * 
 * RENDERING APPROACH:
 *   The CPU path uses a multi-layer compositing strategy:
 *   1. Fill layer (offscreen): Solid shaded triangles
 *   2. Wire layer (offscreen): Wireframe edges
 *   3. Back wire composited under fill (visible through transparent fill)
 *   4. Fill composited with its opacity
 *   5. Front wire composited on top (always visible)
 * 
 *   This approach allows independent opacity control and prevents alpha seam
 *   artifacts that would occur with single-pass rendering.
 */

// Import GPU canvas clearing for when switching from GPU to CPU mode
// We need to clear the GPU canvas to prevent stale GPU content from showing
import { clearGpuSceneCanvas } from '../../render/gpu/runtime/clearGpuSceneCanvas.js';

// Import the solid fill renderer - draws shaded triangles to the fill layer
// Uses back-to-front sorting and Blinn-Phong lighting
import { drawSolidFillModel } from '../../render/fill/renderer/drawSolidFillModel.js';

// Import the wireframe renderer - draws depth-bucketed edges
// Uses multiple sub-passes for glow effects and crisp lines
import { drawWireframeModel } from '../../render/wireframe/drawWireframeModel.js';

// Import canvas visibility toggles
// CPU path shows the CPU canvas and hides the GPU canvas
import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';
import { setGpuCanvasHidden } from './setGpuCanvasHidden.js';

// Import projection function for debug axes
// Converts 3D points to 2D screen coordinates
import { project } from '../../render/camera/projection/project.js';

// Import the offscreen wire layer for wireframe rendering
// This provides a separate canvas for wireframe compositing
import { getOrCreateWireLayer } from '../getOrCreateWireLayer.js';

/**
 * drawAxes - Draws RGB orientation axes for debugging rotation
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
 * 
 * This helper draws three lines from the origin:
 * - Red: X axis
 * - Green: Y axis  
 * - Blue: Z axis
 * 
 * The axes are rotated by the current rotation matrix so they show
 * the model's orientation. Useful for debugging rotation issues.
 */
function drawAxes(ctx) {
  // Get the current rotation matrix from physics state
  const R = globalThis.PHYSICS_STATE.R;
  
  // Helper to rotate a 3D vector by the rotation matrix
  // This applies the same rotation that's applied to the model
  const rotate = v => [
    R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
    R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
    R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
  ];
  
  // Project the origin and axis endpoints to 2D screen coordinates
  const o  = project(rotate([0,0,0]));  // Origin
  const px = project(rotate([1,0,0]));  // X axis end
  const py = project(rotate([0,1,0]));  // Y axis end
  const pz = project(rotate([0,0,1]));  // Z axis end
  
  // Draw the three axis lines with appropriate colors
  ctx.save();
  ctx.lineWidth = 2;
  
  // Red X axis
  ctx.strokeStyle = 'red';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(px[0], px[1]); ctx.stroke();
  
  // Green Y axis
  ctx.strokeStyle = 'green';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(py[0], py[1]); ctx.stroke();
  
  // Blue Z axis
  ctx.strokeStyle = 'blue';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(pz[0], pz[1]); ctx.stroke();
  
  ctx.restore();
}

/**
 * renderCpuPath - Renders the 3D model using the CPU (Canvas 2D) rendering path
 * 
 * @param {Object} meshToRender - The mesh object to render { V, F, E }
 * @param {boolean} backgroundOnSeparateCanvas - Whether background is on its own canvas
 * 
 * This function handles the complete CPU rendering pipeline:
 * 1. Canvas visibility management (show CPU, hide GPU)
 * 2. Clearing canvases to prevent ghosting
 * 3. Drawing solid fill to offscreen layer
 * 4. Drawing wireframe to offscreen layer
 * 5. Compositing layers with proper opacity blending
 * 6. Drawing debug axes (when enabled)
 */
export function renderCpuPath(meshToRender, backgroundOnSeparateCanvas) {
  // Get the main rendering context
  const ctx = globalThis.ctx;
  
  // Show the CPU canvas, hide the GPU canvas
  // This ensures the correct canvas is visible for CPU rendering
  setCpuCanvasHidden(false);
  setGpuCanvasHidden(true);
  
  // If GPU was used last frame, clear the GPU scene canvas
  // This prevents stale GPU content from showing through
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    clearGpuSceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  
  // Always clear the main canvas before drawing
  // This prevents ghosting from previous frames
  // Even if background is on another layer, clearing is safe and guarantees clean state
  if (ctx) {
    // Debug logging for canvas clearing (only when DEBUG_CLEAR is set)
    if (globalThis.DEBUG_CLEAR) {
      console.debug('[renderCpuPath] clearing canvas', ctx.canvas?.id, 'W,H', globalThis.W, globalThis.H);
    }
    
    // Save context state, reset transform, clear, then restore
    // Resetting transform ensures we clear the entire canvas regardless of any
    // transforms that might have been applied
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // Reset to identity transform
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
    
    if (globalThis.DEBUG_CLEAR) console.debug('[renderCpuPath] cleared main canvas');
  }
  
  // Always clear the fill layer before drawing
  // The fill layer is an offscreen canvas used for solid fill rendering
  // Clearing it prevents artifacts from previous frames
  if (globalThis.fillLayerCtx && globalThis.fillLayerCanvas) {
    globalThis.fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
    globalThis.fillLayerCtx.clearRect(0, 0, globalThis.W, globalThis.H);
  }
  
  // Step 1: Draw solid fill to its own offscreen layer at full alpha
  // We draw at full alpha here and control opacity during compositing
  // This approach prevents alpha accumulation artifacts
  drawSolidFillModel(meshToRender, 1);

  // Step 2: Draw wireframe to its own offscreen layer at full alpha
  // Get or create the wire layer canvas
  let wireLayer = getOrCreateWireLayer();
  const wireCtx = wireLayer.ctx;
  
  // Clear the wire layer before drawing
  wireCtx.clearRect(0, 0, globalThis.W, globalThis.H);
  
  // Temporarily swap the global ctx so drawWireframeModel draws to our wire layer
  // This is a workaround because the wireframe renderer reads globalThis.ctx
  const prevCtx = globalThis.ctx;
  globalThis.ctx = wireCtx;
  drawWireframeModel(meshToRender, 1);  // Draw at full alpha, composite later
  globalThis.ctx = prevCtx;  // Restore the original context

  // Step 3: Composite layers with proper opacity blending
  // This is where the visual magic happens - we blend fill and wire layers
  // with independent opacity control
  if (ctx) {
    const w = globalThis.W, h = globalThis.H;
    
    // Create a temporary canvas for back-facing wireframe edges
    // Back edges are those facing away from the camera (hidden by solid fill)
    const backWireLayer = document.createElement('canvas');
    backWireLayer.width = w;
    backWireLayer.height = h;
    const backWireCtx = backWireLayer.getContext('2d');
    
    // Draw only back-facing wireframe edges to the temp layer
    // The 'back' parameter tells the renderer to only draw back-facing edges
    drawWireframeModel(meshToRender, 1, backWireCtx, 'back');

    // Begin compositing
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    
    // Composite 1: Back wireframe under fill
    // When fill is opaque (100%), back wireframe is completely hidden
    // When fill is transparent, back wireframe becomes visible
    // This creates the effect of seeing through the solid fill to the wireframe behind
    if (globalThis.FILL_OPACITY < 0.999) {
      // Modulate back wire visibility by wire opacity AND fill transparency
      ctx.globalAlpha = globalThis.WIRE_OPACITY * (1 - globalThis.FILL_OPACITY);
      ctx.drawImage(backWireLayer, 0, 0);
    }
    
    // Composite 2: Fill layer with its opacity
    // The fill layer contains the solid shaded triangles
    ctx.globalAlpha = globalThis.FILL_OPACITY;
    ctx.drawImage(globalThis.fillLayerCanvas, 0, 0);
    
    // Composite 3: Front-facing/silhouette wireframe edges on top
    // These are always visible (modulated by wire opacity) because they're
    // the edges facing the camera
    // The 'front' parameter tells the renderer to only draw front-facing edges
    drawWireframeModel(meshToRender, 1, ctx, 'front');
    
    // Reset alpha to full opacity
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Draw orientation axes for debugging rotation
  // This is a development aid that shows the X/Y/Z axes in red/green/blue
  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    drawAxes(ctx);
  }

  return true;
}
