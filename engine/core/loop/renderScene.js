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

// Import the background particle renderer
// Draws animated ambient particles on the background canvas
import { drawBackground } from '../../render/background/background/drawBackground.js';

// Import the CPU foreground renderer
// Draws solid fill and wireframe using Canvas 2D
import { renderCpuPath } from './renderCpuPath.js';

// Import the mixed-state handler
// Manages canvas visibility when switching between GPU and CPU
import { handleOtherCases } from './handleOtherCases.js';

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
 * These metrics are used by updateTelemetry to display performance stats.
 */
export function renderScene(nowMs) {
  // Get the current active model
  // If no model is loaded, we still render the background but skip foreground
  const currentModel = globalThis.MODEL;
  
  // Early exit: if no model is loaded, render background only
  // This allows the particle background to animate even before a shape is selected
  if (!currentModel) {
    drawBackground(nowMs);
    // Return zero metrics since no foreground was rendered
    return { bgMs: 0, fgMs: 0, drewCpuForeground: false, backgroundOnSeparateCanvas: false };
  }

  // Step 1: Render background particles and measure time
  // drawBackground returns true if background is on a separate canvas
  const bgStartMs = performance.now();
  const backgroundOnSeparateCanvas = drawBackground(nowMs) === true;
  const bgMs = performance.now() - bgStartMs;

  // Step 2: Prepare foreground rendering
  const fgStartMs = performance.now();
  let drewCpuForeground = false;

  // Step 3: Advance morph animation if one is in progress
  // This updates the morph state and prepares interpolated vertices
  // The morph system is accessed via globalThis.morph for flexibility
  if (globalThis.morph?.advanceMorphFrame) globalThis.morph.advanceMorphFrame();

  // Step 4: Determine which mesh to render
  // If morphing, use the interpolated morph mesh; otherwise use the current model
  const morphing = globalThis.morph?.isMorphing?.() ?? false;
  const meshToRender = morphing ? globalThis.morph?.getCurrentMorphMesh?.() ?? currentModel : currentModel;

  // Step 5: Render foreground using CPU path
  // Currently always uses CPU path (GPU path is disabled in this configuration)
  drewCpuForeground = renderCpuPath(meshToRender, backgroundOnSeparateCanvas);
  
  // Step 6: Ensure GPU canvas isn't accidentally shown
  // This handles edge cases where GPU canvas might be visible from a previous frame
  handleOtherCases(backgroundOnSeparateCanvas, false);

  // Calculate foreground rendering time
  const fgMs = performance.now() - fgStartMs;
  
  // Return metrics for telemetry
  return { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas };
}
