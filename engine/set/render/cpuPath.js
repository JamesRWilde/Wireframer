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

// Import model state to ensure CPU mode uses capped model
import { modelState } from '@engine/state/render/model.js';

// Import detail level to allow CPU path to react to slider changes
import { detailLevel } from '@engine/set/mesh/detailLevel.js';

// Import shared canvas context getter (replacing globalThis.ctx usage)
import { getCanvasCtx } from '@engine/get/render/getCanvasCtx.js';
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';

// Keep track of last vertex count and LOD percent to avoid flooding console
let lastCpuMeshVertCount = -1;
let lastCpuLodPct = null;

/**
 * cpuPath - Executes the CPU rendering path for a frame
 *
 * @param {Object} meshToRender - The mesh model to render { V, F, E }
 * @param {boolean} [backgroundOnSeparateCanvas] - Whether background renders on a separate canvas
 * @returns {boolean} true if the CPU path was executed
 */
export function cpuPath(meshToRender, backgroundOnSeparateCanvas, morphing) {
  const ctx = getCanvasCtx();

  // Ensure CPU rendering respects the current LOD slider value.
  // If the slider changed since last frame, re-run detailLevel to update currentLodModel.
  const lodPct = modelState.currentLodPct ?? 1;
  if (lodPct !== lastCpuLodPct) {
    lastCpuLodPct = lodPct;
    console.log(`[cpuPath] lodPct changed to ${lodPct.toFixed(2)} - recalculating LOD`);
    detailLevel(lodPct);
  }

  // If morphing, use the morph interpolated mesh directly.
  // Otherwise, prefer the CPU LOD-capped model to avoid rendering full-detail geometry.
  const cpuMesh = morphing
    ? meshToRender
    : (modelState.currentLodModel || modelState.cpuBaseModel || modelState.baseModel || meshToRender);

  const vertCount = cpuMesh?.V?.length ?? 0;
  if (vertCount !== lastCpuMeshVertCount) {
    console.log(`[cpuPath] rendering mesh verts=${vertCount} (cpuBase=${modelState.cpuBaseModel?.V?.length ?? 0}, currentLod=${modelState.currentLodModel?.V?.length ?? 0})`);
    lastCpuMeshVertCount = vertCount;
  }

  // Show CPU canvas, hide GPU canvas
  canvasCpuHidden(false);
  canvasHidden(true);

  // Clear the GPU canvas if it rendered last frame (prevent stale artifacts)
  const gpuCanvas = getGpuCanvas();
  if (state.gpuSceneDrawnLastFrame && gpuCanvas) {
    const _r = sceneRenderer(); 
    if (_r?.gl) {
      sceneCanvas(_r.gl, gpuCanvas);
    }
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
  renderMeshUnified(cpuMesh, ctx);

  return true;
}
