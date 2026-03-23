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
 *   delegates to setRenderMeshUnified for the actual drawing.
 *
 * DETAILS:
 *   If the GPU rendered last frame, clears the GPU canvas to prevent
 *   stale artifacts from remaining visible.
 */

"use strict";

// Import shared GPU state for cleanup without forcing renderer initialization
import { gpuState } from '@engine/state/gpu/scene.js';

// Import GPU canvas clearer
import { setGpuSceneCanvas }from '@engine/set/gpu/setGpuSceneCanvas.js';

// Import unified CPU mesh renderer
import { setRenderMeshUnified }from '@engine/set/cpu/setRenderMeshUnified.js';

// Import CPU canvas visibility toggle
import { setCanvasCpuHidden }from '@engine/set/cpu/setCanvasCpuHidden.js';

// Import GPU canvas visibility toggle
import { setGpuCanvasHidden }from '@engine/set/gpu/setGpuCanvasHidden.js';
import { state } from '@engine/state/loop.js';
import { getW } from '@engine/get/render/getW.js';
import { getH } from '@engine/get/render/getH.js';

// Import model state to ensure CPU mode uses capped model
import { modelState } from '@engine/state/render/model.js';

// Import detail level to allow CPU path to react to slider changes
import { setDetailLevel } from '@engine/set/mesh/setDetailLevel.js';

// Import shared canvas context getter (replacing legacy ctx usage)
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
export function setCpuPath(meshToRender, backgroundOnSeparateCanvas, morphing) {
  const ctx = getCanvasCtx();

  // Ensure CPU rendering respects the current LOD slider value.
  // If the slider changed since last frame, re-run detailLevel to update currentLodModel.
  const lodPct = modelState.currentLodPct ?? 1;
  if (lodPct !== lastCpuLodPct) {
    lastCpuLodPct = lodPct;
    setDetailLevel(lodPct);
  }

  // If morphing, use the morph interpolated mesh directly.
  // Otherwise, prefer the CPU LOD-capped model to avoid rendering full-detail geometry.
  const cpuMesh = morphing
    ? meshToRender
    : (modelState.currentLodModel || modelState.cpuBaseModel || modelState.baseModel || meshToRender);

  const vertCount = cpuMesh?.V?.length ?? 0;
  if (vertCount !== lastCpuMeshVertCount) {
    lastCpuMeshVertCount = vertCount;
  }

  // Show CPU canvas, hide GPU canvas
  setCanvasCpuHidden(false);
  setGpuCanvasHidden(true);

  // Clear the GPU canvas if it was used on the previous frame (prevent stale artifacts).
  // Do not re-create GPU renderer here; use cached renderer if present.
  const gpuCanvas = getGpuCanvas();
  if (state.gpuSceneDrawnLastFrame && gpuCanvas) {
    const renderer = gpuState.renderer;
    if (renderer?.gl) {
      setGpuSceneCanvas(renderer.gl, gpuCanvas);
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
  setRenderMeshUnified(cpuMesh, ctx);

  return true;
}
