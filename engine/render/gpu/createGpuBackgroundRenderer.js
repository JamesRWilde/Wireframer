
/**
 * createGpuBackgroundRenderer.js - Factory for GPU-accelerated animated background particle renderer
 *
 * PURPOSE:
 *   Sets up and returns a WebGL-based renderer for animated background particles.
 *   Handles context creation, shader setup, and exposes a minimal API for rendering and cleanup.
 *   All helpers (shader source, buffer logic, etc.) are split into separate files for clarity and maintainability.
 *
 * PARAMETERS:
 *   @param {HTMLCanvasElement} canvas - The canvas element to render into. Must be attached to the DOM and sized appropriately.
 *     - If null or context creation fails, returns null.
 *
 * RETURNS:
 *   @returns {Object|null} An object with render(params) and dispose() methods, or null if setup fails.
 *     - render(params): Draws the current frame of background particles.
 *     - dispose(): Releases all GPU resources held by the renderer.
 *
 * USAGE EXAMPLE:
 *   const renderer = createGpuBackgroundRenderer(canvas);
 *   if (renderer) {
 *     renderer.render({ particles, width, height, time, velocityScale, opacityScale, color });
 *   }
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain the main factory function and its export.
 *   - All helpers (shader source, buffer logic, etc.) must be in their own files.
 *   - JSDoc must always be at the very top, before imports.
 *   - Update comments and usage notes if the API or architecture changes.
 */
import { compileShader } from './compileShader.js';
import { vertSrc } from './gpuBackgroundVertShader.js';
import { fragSrc } from './gpuBackgroundFragShader.js';
import { needsRebuild } from './needsRebuild.js';
import { rebuildBuffer } from './rebuildBuffer.js';
import { renderGpuBackground } from './renderGpuBackground.js';
import { disposeGpuBackground } from './disposeGpuBackground.js';
import { renderGpuBackgroundRenderer } from './renderGpuBackgroundRenderer.js';
import { disposeGpuBackgroundRenderer } from './disposeGpuBackgroundRenderer.js';

export function createGpuBackgroundRenderer(canvas) {
  if (!canvas) return null;

  // WebGL context options for performance and visual quality
  const glOpts = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    desynchronized: true,
    powerPreference: 'high-performance'
  };

  // Try to get a WebGL2 or fallback context
  const gl =
    canvas.getContext('webgl2', glOpts) ||
    canvas.getContext('webgl', glOpts) ||
    canvas.getContext('experimental-webgl', glOpts);

  if (!gl) return null;

  let program, buffer;
  let particleCount = 0;
  let locations = {};

  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Background GPU program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    locations = {
      program,
      seedPosLoc: gl.getAttribLocation(program, 'a_seedPos'),
      velLoc: gl.getAttribLocation(program, 'a_vel'),
      sizeLoc: gl.getAttribLocation(program, 'a_size'),
      alphaBaseLoc: gl.getAttribLocation(program, 'a_alphaBase'),
      speedLoc: gl.getAttribLocation(program, 'a_speed'),
      phaseLoc: gl.getAttribLocation(program, 'a_phase'),
      resLoc: gl.getUniformLocation(program, 'u_resolution'),
      timeLoc: gl.getUniformLocation(program, 'u_time'),
      velocityScaleLoc: gl.getUniformLocation(program, 'u_velocityScale'),
      opacityScaleLoc: gl.getUniformLocation(program, 'u_opacityScale'),
      colorLoc: gl.getUniformLocation(program, 'u_color'),
    };
    buffer = gl.createBuffer();
  } catch (err) {
    console.warn('[background-gpu] Shader setup failed:', err);
    return null;
  }

  return {
    render: (params) => {
      particleCount = renderGpuBackgroundRenderer(
        gl,
        locations,
        buffer,
        params,
        needsRebuild,
        rebuildBuffer,
        renderGpuBackground,
        particleCount
      );
    },
    dispose: () => {
      disposeGpuBackgroundRenderer(gl, buffer, program, disposeGpuBackground);
    }
  };
}
