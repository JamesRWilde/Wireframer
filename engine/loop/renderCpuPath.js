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
 *   complete rendering pipeline: clearing canvas and drawing mesh.
 * 
 * RENDERING APPROACH:
 *   Uses unified renderer that draws each triangle with fill and edges in one pass.
 *   No offscreen canvases, no compositing layers.
 */

"use strict";

// Import GPU canvas clearing for when switching from GPU to CPU mode
import { clearGpuSceneCanvas } from '../gpu/clearGpuSceneCanvas.js';

// Import the unified mesh renderer - draws triangles with fill and edges in one pass
import { renderMeshUnified } from '../render/renderMeshUnified.js';

// Import canvas visibility toggles
import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';
import { setGpuCanvasHidden } from './setGpuCanvasHidden.js';

// Import projection function for debug axes
import { project } from '../render/project.js';

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
  const ctx = globalThis.ctx;
  
  setCpuCanvasHidden(false);
  setGpuCanvasHidden(true);
  
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    clearGpuSceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  
  // Clear the main canvas
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
  }
  
  // Render mesh: each triangle gets fill + edges in one pass
  renderMeshUnified(meshToRender, ctx);

  // Draw orientation axes for debugging rotation
  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    drawAxes(ctx);
  }

  return true;
}
