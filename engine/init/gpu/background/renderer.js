/**
 * GPU Background Particle Renderer - WebGL Implementation
 *
 * PURPOSE:
 *   High-performance particle rendering using WebGL. Renders all particles
 *   in a single draw call using vertex buffers and shaders. Dramatically
 *   faster than Canvas 2D path, especially with high particle counts.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawBackground when GPU mode is available and enabled.
 *   Receives packed particle data (Float32Array) from the background worker
 *   and renders it using WebGL. Manages shader program, buffers, and context.
 *
 * RENDERING TECHNIQUE:
 *   - Each particle is a vertex with attributes: x, y, size, alpha
 *   - Vertex shader converts to clip space and passes color/alpha
 *   - Fragment shader outputs final color
 *   - Uses gl.POINTS for simplicity (or quads if needed for larger sizes)
 *
 * PERFORMANCE:
 *   - Single gl.drawArrays() call per frame
 *   - Zero per-particle state changes
 *   - GPU handles all transformation and blending
 *
 * USAGE:
 *   const renderer = createBackgroundRenderer(gl);
 *   renderer(gl, particleData, particleCount, width, height, color, opacity);
 *
 * CLEANUP:
 *   Call disposeBackgroundRenderer(gl, renderer) when done.
 */

"use strict";

import { compileShader } from '@engine/init/gpu/compileShader.js';

// Vertex shader source
const VERTEX_SHADER = `
precision highp float;

attribute vec4 aParticle; // x, y, size, alpha
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 clipPos = (aParticle.xy / uResolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;
  gl_Position = vec4(clipPos, 0.0, 1.0);
  gl_PointSize = aParticle.z; // Use point size for gl.POINTS
  vColor = uColor;
  vAlpha = aParticle.w * uOpacity;
}
`;

// Fragment shader source
const FRAGMENT_SHADER = `
precision highp float;

varying float vAlpha;
varying vec3 vColor;

void main() {
  // For gl.POINTS, gl_PointCoord gives coordinate within the point (0-1)
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard; // Circle shape

  // Soft edge anti-aliasing
  float alpha = vAlpha * (1.0 - smoothstep(0.35, 0.5, dist));
  gl_FragColor = vec4(vColor, alpha);
}
`;

/**
 * createBackgroundRenderer - Creates the GPU background particle renderer
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @returns {Object|null} Renderer object with draw() and dispose() methods, or null on failure
 */
export function createBackgroundRenderer(gl) {
  try {
    // Compile shaders
    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    // Link program
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      console.error('[BackgroundGPU] Program link failed:', info);
      return null;
    }

    // Clean up shaders (they're now part of the program)
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    // Get attribute and uniform locations
    const aParticle = gl.getAttribLocation(program, 'aParticle');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uColor = gl.getUniformLocation(program, 'uColor');
    const uOpacity = gl.getUniformLocation(program, 'uOpacity');

    // Create particle buffer (dynamic, updated each frame)
    const particleBuffer = gl.createBuffer();

    return {
      program,
      aParticle,
      uResolution,
      uColor,
      uOpacity,
      particleBuffer,

      /**
       * draw - Renders particles for this frame
       *
       * @param {Float32Array} data - Packed particle data [x, y, size, alpha, ...]
       * @param {number} count - Number of particles
       * @param {number} width - Canvas width
       * @param {number} height - Canvas height
       * @param {string} colorStr - Particle color as hex #RRGGBB or rgba()
       * @param {number} opacity - Global opacity multiplier (0-1)
       */
      draw(gl, data, count, width, height, colorStr, opacity) {
        if (!data || count === 0) return;

        // Parse color to RGB (0-1 range)
        let r = 0, g = 0, b = 0;
        if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
          r = parseInt(colorStr.slice(1, 3), 16) / 255;
          g = parseInt(colorStr.slice(3, 5), 16) / 255;
          b = parseInt(colorStr.slice(5, 7), 16) / 255;
        } else {
          const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            r = parseInt(match[1]) / 255;
            g = parseInt(match[2]) / 255;
            b = parseInt(match[3]) / 255;
          }
        }

        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(uResolution, width, height);
        gl.uniform3f(uColor, r, g, b);
        gl.uniform1f(uOpacity, opacity);

        // Bind particle buffer and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

        // Enable and set attribute pointer (4 floats per particle)
        gl.enableVertexAttribArray(aParticle);
        gl.vertexAttribPointer(aParticle, 4, gl.FLOAT, false, 16, 0);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Draw particles as points
        gl.drawArrays(gl.POINTS, 0, count);
      },

      /**
       * dispose - Releases GPU resources
       *
       * @param {WebGLRenderingContext} gl - The WebGL context
       */
      dispose(gl) {
        if (program) gl.deleteProgram(program);
        if (particleBuffer) gl.deleteBuffer(particleBuffer);
      }
    };
  } catch (error) {
    console.error('[BackgroundGPU] Failed to create renderer:', error);
    return null;
  }
}
