/**
 * cpuPath.js - CPU Render Path
 *
 * PURPOSE:
 *   Orchestrates the CPU-based rendering path: shows the CPU canvas,
 *   hides the GPU canvas, clears the framebuffer, and renders the mesh
 *   with the CPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Called by the render loop when the engine is in CPU mode.
 *   Switches canvas visibility, manages GPU state cleanup, and
 *   delegates to renderMeshUnified for the actual drawing.
 *
 * DETAILS:
 *   If the GPU rendered last frame, clears the GPU canvas to prevent
 *   stale artifacts from remaining visible.
 */

"use strict";

// Import GPU renderer getter for GPU canvas cleanup
import { sceneRenderer } from '@engine/get/gpu/sceneRenderer.js';

// Import GPU canvas clearer
import { sceneCanvas }from '@engine/set/gpu/clear/sceneCanvas.js';

// Import unified CPU mesh renderer
import { renderMeshUnified }from '@engine/set/cpu/renderMeshUnified.js';

// Import CPU canvas visibility toggle
import { canvasCpuHidden }from '@engine/set/cpu/canvasCpuHidden.js';

// Import GPU canvas visibility toggle
import { canvasHidden }from '@engine/set/gpu/canvasHidden.js';
import { state } from '@engine/state/engine/loop.js';
import { getW, getH } from '@engine/state/render/viewportState.js';
import { trace } from '@engine/state/render/forensicLog.js';

/**
 * cpuPath - Executes the CPU rendering path for a frame
 *
 * @param {Object} meshToRender - The mesh model to render { V, F, E }
 * @param {boolean} [backgroundOnSeparateCanvas] - Whether background renders on a separate canvas
 * @returns {boolean} true if the CPU path was executed
 */
export function cpuPath(meshToRender, backgroundOnSeparateCanvas) {
  const ctx = globalThis.ctx;

  // Show CPU canvas, hide GPU canvas
  canvasCpuHidden(false);
  canvasHidden(true);

  // Clear the GPU canvas if it rendered last frame (prevent stale artifacts)
  if (state.gpuSceneDrawnLastFrame) {
    const _r = sceneRenderer(); if (_r?.gl) sceneCanvas(_r.gl, globalThis.gpuCanvas);
    state.gpuSceneDrawnLastFrame = false;
  }

  // Clear the main canvas for new frame
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, getW(), getH());
    ctx.restore();
  }

  // Render the mesh using the unified CPU pipeline
  const meshEnd = trace('renderMeshUnified', 'render', { verts: meshToRender?.V?.length, tris: meshToRender?.F?.length });
  renderMeshUnified(meshToRender, ctx);
  meshEnd({});

  return true;
}
