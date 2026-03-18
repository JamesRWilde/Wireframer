/**
 * renderScene.js - Scene Rendering Orchestrator
 * 
 * PURPOSE:
 *   Coordinates the rendering of all visual elements each frame: background particles
 *   and foreground 3D model. This is the main rendering entry point called by runFrame,
 *   and it handles the decision of what to render and how to measure performance.
 * 
 * ARCHITECTURE ROLE:
 *   Sits between runFrame (which calls this) and the actual renderers (background,
 *   CPU path, GPU path). It manages the rendering order, morph state, and timing
 *   measurements that feed into the telemetry system.
 * 
 * RENDERING ORDER:
 *   1. Background particles (always rendered)
 *   2. Morph frame advancement (if morphing)
 *   3. Foreground model (CPU or GPU path)
 *   4. Canvas state management
 */

"use strict";

// Import the background particle renderer
// Draws animated ambient particles on the background canvas
import { background as drawBackground }from '@engine/set/render/draw/background.js';

// Import the CPU foreground renderer
// Draws solid fill and wireframe using Canvas 2D
import { cpuPath }from '@engine/set/render/cpuPath.js';

// Import the GPU foreground renderer
// Draws using WebGL for hardware-accelerated rendering
import { gpuPath as renderGpuPath }from '@engine/set/render/gpuPath.js';

// Import the render mode resolver
// Determines whether to use GPU or CPU based on WebGL availability
import { foregroundRenderMode }from '@engine/get/engine/foregroundRenderMode.js';

// Import decimation for GPU LOD matching
import { decimateByPercent }from '@engine/init/mesh/decimateByPercent.js';

// Import loop state to read the current render mode
import { state }from '@engine/state/engine/loop.js';

// Import the mixed-state handler
// Manages canvas visibility when switching between GPU and CPU
import { mixedRenderFlags }from '@engine/set/engine/mixedRenderFlags.js';
import { modelState } from '@engine/state/render/model.js';
import { trace, mark } from '@engine/state/render/forensicLog.js';

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
export function scene(nowMs) {
  const currentModel = modelState.model;

  if (!currentModel) {
    drawBackground(nowMs);
    return { bgMs: 0, fgMs: 0, drewCpuForeground: false, backgroundOnSeparateCanvas: false };
  }

  // Step 1: Render background particles
  const bgEnd = trace('background', 'render');
  const bgStartMs = performance.now();
  const backgroundOnSeparateCanvas = drawBackground(nowMs) === true;
  const bgMs = performance.now() - bgStartMs;
  bgEnd({ ms: bgMs });

  // Step 2: Prepare foreground rendering
  const fgStartMs = performance.now();
  let drewCpuForeground = false;

  // Step 3: Advance morph animation
  if (globalThis.morph?.advanceMorphFrame) globalThis.morph.advanceMorphFrame();

  // Step 4: Determine which mesh to render
  const morphing = globalThis.morph?.isMorphing?.() ?? false;
  const baseMesh = morphing ? globalThis.morph?.currentMorph?.() ?? currentModel : currentModel;

  foregroundRenderMode();

  let meshToRender = baseMesh;
  const lodChanged = modelState.currentLodPct !== 1;
  if (morphing) {
    meshToRender = baseMesh;
  } else if (state.foregroundRenderMode === 'gpu' && modelState.baseModel?.V?.length) {
    if (lodChanged) {
      meshToRender = decimateByPercent(modelState.baseModel, modelState.currentLodPct);
    } else {
      meshToRender = modelState.baseModel;
    }
  } else {
    meshToRender = modelState.currentLodModel || baseMesh;
  }

  const triCount = meshToRender?.F?.length ?? 0;

  // Step 5: Render foreground
  let gpuDrawn = false;
  if (state.foregroundRenderMode === 'gpu') {
    const gpuEnd = trace('gpuPath', 'render', { triCount });
    gpuDrawn = renderGpuPath(meshToRender, morphing);
    gpuEnd({ drawn: gpuDrawn });
    if (!gpuDrawn) {
      const cpuEnd = trace('cpuPath', 'render', { triCount });
      drewCpuForeground = cpuPath(meshToRender, backgroundOnSeparateCanvas);
      cpuEnd({});
    }
  } else {
    const cpuEnd = trace('cpuPath', 'render', { triCount });
    drewCpuForeground = cpuPath(meshToRender, backgroundOnSeparateCanvas);
    cpuEnd({});
  }

  mixedRenderFlags(backgroundOnSeparateCanvas, gpuDrawn);

  const fgMs = performance.now() - fgStartMs;
  return { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas };
}
