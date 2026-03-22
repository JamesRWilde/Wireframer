/**
 * renderGpuPath.js - GPU (WebGL) Foreground Rendering Path
 * 
 * PURPOSE:
 *   Implements the GPU-based rendering path for the 3D model. This path uses
 *   WebGL for hardware-accelerated rendering and is the preferred path when
 *   available. It falls back to CPU rendering if GPU initialization fails.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the frame loop when foregroundRenderMode is 'gpu'. Delegates to
 *   drawGpuSceneModel which handles shader compilation, buffer management, and
 *   WebGL draw calls. Manages canvas visibility and fallback logic.
 * 
 * GPU VS CPU:
 *   - GPU path: Faster, uses WebGL shaders for fill and wire rendering
 *   - CPU path: Fallback, uses Canvas 2D for all rendering
 *   - The app automatically selects GPU when available, falls back to CPU
 */

"use strict";

// Import the GPU scene renderer - handles all WebGL operations
// This includes shader compilation, buffer setup, and draw calls
import { drawSceneModel as drawGpuSceneModel }from '@engine/set/gpu/drawSceneModel.js';

// Import canvas visibility toggles
// GPU path shows the GPU canvas and hides the CPU canvas
import { canvasHidden }from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden }from '@engine/set/cpu/canvasCpuHidden.js';
import { getRotation } from '@engine/state/render/physicsState.js';
import { getZoom, getZHalf } from '@engine/state/render/zoomState.js';
import { getModelCy } from '@engine/get/render/getModelCy.js';
// getZHalf moved to zoomState import
import { getW } from '@engine/get/render/getW.js';
import { getH } from '@engine/get/render/getH.js';
import { getTheme } from '@engine/get/render/getTheme.js';
import { getEdgeColor } from '@engine/get/render/getEdgeColor.js';
import { getFillRgb } from '@engine/get/render/getFillRgb.js';
import { getFillOpacity } from '@engine/get/render/getFillOpacity.js';
import { getWireOpacity } from '@engine/get/render/getWireOpacity.js';
import { getShadeDarkRgb } from '@engine/get/render/getShadeDarkRgb.js';
import { getShadeBrightRgb } from '@engine/get/render/getShadeBrightRgb.js';
import { renderState } from '@engine/state/render/renderState.js';
import { hexToRgb } from '@engine/set/render/hexToRgb.js';

/**
 * renderGpuPath - Renders the 3D model using the GPU (WebGL) rendering path
 * 
 * @param {Object} meshToRender - The mesh object to render { V, F, E }
 * @param {boolean} morphing - Whether a morph animation is in progress
 *   When true, geometry is marked as dynamic for buffer updates
 * 
 * @returns {boolean} Whether GPU rendering succeeded
 *   true: GPU rendering completed successfully
 *   false: GPU rendering failed, CPU fallback was triggered
 * 
 * This function:
 * 1. Calls drawGpuSceneModel with all rendering parameters
 * 2. Updates canvas visibility based on success/failure
 * 3. Falls back to CPU mode if GPU rendering fails
 */

export function gpuPath(gl, meshToRender, morphing) {
  // Call the GPU renderer with all necessary parameters
  // These are gathered from renderState and passed as a config object
  // Use the computed edge color (high contrast) for GPU wire rendering.
  // This ensures wires remain visible regardless of theme fill colors.
  const edgeColor = hexToRgb(getEdgeColor());

  // Use the theme-derived shade colors (same as CPU) so GPU shading matches.
  // This ensures the fill color matches the HUD RGB-based theme palette.
  const shadeDark = getShadeDarkRgb();
  const shadeBright = getShadeBrightRgb();
  const fillRgb = getFillRgb();
  const baseTheme = getTheme() || {};

  const gpuDrawn = drawGpuSceneModel(gl, meshToRender, {
    // Theme colors for shading and wire
    theme: {
      ...baseTheme,
      fill: baseTheme.fill || fillRgb,
      shadeDark,
      shadeBright,
      wireNear: edgeColor,
      wireFar: edgeColor,
    },

    // Opacity controls - modulate fill and wire visibility
    fillAlpha: getFillOpacity(),
    wireAlpha: getWireOpacity(),
    wireWidth: Number(renderState.wireWidth || 1),

    // Camera parameters - control view and projection
    zoom: getZoom(),
    modelCy: getModelCy(),  // Model vertical center for projection
    zHalf: getZHalf(),      // Half-depth for depth calculations

    // Canvas dimensions - required for viewport setup
    width: getW(),
    height: getH(),

    // Rotation matrix - applied to all vertices
    rotation: getRotation(),
  });
  
  // Update canvas visibility based on rendering success
  if (gpuDrawn) {
    canvasHidden(false);
    canvasCpuHidden(true);
  } else {
    // GPU rendering failed - this should be rare if initialization succeeded
    // We don't fall back to CPU here because the CPU pipeline is not initialized
    // Just hide the GPU canvas to show nothing rather than stale content
    canvasHidden(true);
  }

  return gpuDrawn;
}
