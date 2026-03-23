/**
 * renderScene.js - Scene Rendering Orchestrator
 * 
 * PURPOSE:
 *   Coordinates the rendering of all visual elements each frame: background particles
 *   and foreground 3D model. This is the main rendering entry point called by setRunFrame,
 *   and it handles the timing measurements for telemetry.
 * 
 * ARCHITECTURE ROLE:
 *   Sits between setRunFrame (which calls this) and the active foreground renderer
 *   (either GPU or CPU path, determined at startup). Manages rendering order,
 *   morph state, and timing measurements.
 *
 * WHY THIS EXISTS:
 *   Centralizes full-scene rendering orchestration (background + foreground) and
 *   timing instrumentation around a single function call from the loop.
 *
 * RENDERING ORDER:
 *   1. Background particles (always rendered)
 *   2. Morph frame advancement (if morphing)
 *   3. Foreground model (active pipeline - no checks, just call)
 *   4. Canvas state management
 * 
 * NOTE:
 *   The foreground renderer is selected once at startup via initRenderPipeline().
 *   There is NO per-frame mode checking - we simply call the active renderer.
 */

"use strict";

// Import the background particle renderer
// Draws animated ambient particles on the background canvas
import { setDrawBackground } from '@engine/set/render/draw/setDrawBackground.js';

// Import the active foreground renderer function pointer
// This is set to either gpuPath or cpuPath during initialization
import { getRenderForeground } from '@engine/get/render/getRenderForeground.js';
import { isGpuMode as getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';

// Import decimation for GPU LOD matching
import { decimateByPercent } from '@engine/init/mesh/initDecimateByPercent.js';

// Import the mixed-state handler
// Manages canvas visibility when switching between GPU and CPU
import { setMixedRenderFlags } from '@engine/set/engine/setMixedRenderFlags.js';

// Import model state to access the current mesh
import { modelState } from '@engine/state/render/stateModel.js';
import { getMorph } from '@engine/get/mesh/getMorph.js';

/**
 * renderScene - Renders the complete scene (background + foreground)
 * 
 * @param {number} nowMs - Current timestamp from requestAnimationFrame
 *   Used for animation timing (particle movement, morph interpolation)
 * 
 * @returns {Object} Rendering performance metrics
 *   @returns {number} bgMs - Time spent rendering background (milliseconds)
 *   @returns {number} fgMs - Time spent rendering foreground (milliseconds)
 *   @returns {boolean} drewCpuForeground - Whether CPU foreground was rendered
 *   @returns {boolean} backgroundOnSeparateCanvas - Whether background is on its own canvas
 * 
 * These metrics are used by telemetryState to display performance stats.
 */
export function setScene(nowMs) {
  const currentModel = modelState.model;

  if (!currentModel) {
    setDrawBackground(nowMs);
    return { bgMs: 0, fgMs: 0, drewCpuForeground: false, backgroundOnSeparateCanvas: false };
  }

  // Step 1: Render background particles
  const bgStartMs = performance.now();
  const backgroundOnSeparateCanvas = setDrawBackground(nowMs) === true;
  const bgMs = performance.now() - bgStartMs;

  // Step 2: Prepare foreground rendering
  const fgStartMs = performance.now();

  // Step 3: Advance morph animation
  const morphApi = getMorph();
  if (morphApi?.advanceMorphFrame) morphApi.advanceMorphFrame();

  // Step 4: Determine which mesh to render
  const morphing = morphApi?.getIsMorphing?.() ?? false;
  const baseMesh = morphing ? morphApi?.currentMorph?.() ?? currentModel : currentModel;

  // Select mesh based on LOD and morph state
  // GPU mode uses baseModel with optional LOD decimation
  // CPU mode uses currentLodModel (which may be pre-decimated)
  let meshToRender;
  if (morphing) {
    meshToRender = baseMesh;
  } else if (getIsGpuMode() && modelState.baseModel?.V?.length) {
    // GPU path: use base model with optional LOD decimation
    const lodChanged = modelState.currentLodPct !== 1;
    if (lodChanged) {
      meshToRender = decimateByPercent(modelState.baseModel, modelState.currentLodPct);
    } else {
      meshToRender = modelState.baseModel;
    }
  } else {
    // CPU path: prefer the current LOD model (prepared by detailLevel).
    // Fall back to the capped CPU base model if LOD hasn't been computed yet.
    meshToRender = modelState.currentLodModel || modelState.cpuBaseModel || baseMesh;
  }

  // Step 5: Render foreground using the active pipeline
  // getRenderForeground returns the function pointer set during initialization
  // There is NO fallback - only one pipeline exists and if it fails, nothing renders
  const renderFn = getRenderForeground();
  const drewCpuForeground = renderFn(meshToRender, backgroundOnSeparateCanvas, morphing);
  
  // For GPU mode, the return value indicates success (true) or failure (false)
  // For CPU mode, the return value is always true
  // (Fix: isGpuMode is a function and must be invoked)
  const gpuDrawn = getIsGpuMode() && drewCpuForeground;

  setMixedRenderFlags(backgroundOnSeparateCanvas, gpuDrawn);

  const fgMs = performance.now() - fgStartMs;
  return { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas };
}
