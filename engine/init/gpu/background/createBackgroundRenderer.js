/**
 * GPU Background Particle Renderer - WebGL Implementation
 *
 * PURPOSE:
 *   High-performance particle rendering using WebGL. Renders all particles
 *   in a single draw call using vertex buffers and shaders. Dramatically
 *   faster than Canvas 2D path, especially with high particle counts.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawBackground when GPU mode is available and enabled.
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
import { utilParsedCssColor } from '@engine/util/render/background/utilParsedCssColor.js';
import { createParticleBufferData } from '@engine/init/gpu/background/createParticleBufferData.js';
import { getBgVertexShader } from '@engine/get/render/background/getBgVertexShader.js';
import { getBgFragmentShader } from '@engine/get/render/background/getBgFragmentShader.js';

const VERTEX_SHADER = getBgVertexShader();
const FRAGMENT_SHADER = getBgFragmentShader();

export function createBackgroundRenderer(gl) {
  try {
    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

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

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    const locations = {
      aSeedPos: gl.getAttribLocation(program, 'aSeedPos'),
      aVelocity: gl.getAttribLocation(program, 'aVelocity'),
      aSize: gl.getAttribLocation(program, 'aSize'),
      aAlphaBase: gl.getAttribLocation(program, 'aAlphaBase'),
      aSpeed: gl.getAttribLocation(program, 'aSpeed'),
      aPhase: gl.getAttribLocation(program, 'aPhase'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uColor: gl.getUniformLocation(program, 'uColor'),
      uOpacity: gl.getUniformLocation(program, 'uOpacity'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uVelocityScale: gl.getUniformLocation(program, 'uVelocityScale'),
    };

    const particleBuffer = gl.createBuffer();
    let particleCount = 0;
    let currentSettings = {};

    function updateParticleData(settings) {
      const needsRebuild = !currentSettings.width ||
        currentSettings.width !== settings.width ||
        currentSettings.height !== settings.height ||
        currentSettings.density !== settings.density ||
        currentSettings.baseSpeed !== settings.baseSpeed;

      if (needsRebuild) {
        currentSettings = { ...settings };
        const packed = createParticleBufferData(settings.width, settings.height, settings.density, settings.baseSpeed);
        particleCount = packed.count;

        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, packed.data, gl.STATIC_DRAW);
      }
    }

    return {
      draw(gl, opts) {
        updateParticleData({
          width: opts.width,
          height: opts.height,
          density: opts.density,
          baseSpeed: opts.velocityScale,
        });

        if (!particleCount || !particleBuffer) return;

        let color;
        if (Array.isArray(opts.colorRgb) && opts.colorRgb.length === 3) {
          color = { r: opts.colorRgb[0], g: opts.colorRgb[1], b: opts.colorRgb[2], a: 1 };
        } else {
          color = utilParsedCssColor(opts.color || '#ffffff');
        }

        gl.viewport(0, 0, opts.width, opts.height);
        gl.useProgram(program);
        gl.uniform2f(locations.uResolution, opts.width, opts.height);
        gl.uniform3f(locations.uColor, color.r, color.g, color.b);
        gl.uniform1f(locations.uOpacity, opts.opacity * color.a);
        gl.uniform1f(locations.uTime, opts.time);
        gl.uniform1f(locations.uVelocityScale, opts.velocityScale);

        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);

        const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

        gl.enableVertexAttribArray(locations.aSeedPos);
        gl.vertexAttribPointer(locations.aSeedPos, 2, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(locations.aVelocity);
        gl.vertexAttribPointer(locations.aVelocity, 2, gl.FLOAT, false, stride, 8);

        gl.enableVertexAttribArray(locations.aSize);
        gl.vertexAttribPointer(locations.aSize, 1, gl.FLOAT, false, stride, 16);

        gl.enableVertexAttribArray(locations.aAlphaBase);
        gl.vertexAttribPointer(locations.aAlphaBase, 1, gl.FLOAT, false, stride, 20);

        gl.enableVertexAttribArray(locations.aSpeed);
        gl.vertexAttribPointer(locations.aSpeed, 1, gl.FLOAT, false, stride, 24);

        gl.enableVertexAttribArray(locations.aPhase);
        gl.vertexAttribPointer(locations.aPhase, 1, gl.FLOAT, false, stride, 28);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawArrays(gl.POINTS, 0, particleCount);

        // Disable attribute arrays to avoid interfering with the scene renderer.
        gl.disableVertexAttribArray(locations.aSeedPos);
        gl.disableVertexAttribArray(locations.aVelocity);
        gl.disableVertexAttribArray(locations.aSize);
        gl.disableVertexAttribArray(locations.aAlphaBase);
        gl.disableVertexAttribArray(locations.aSpeed);
        gl.disableVertexAttribArray(locations.aPhase);
      },

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





