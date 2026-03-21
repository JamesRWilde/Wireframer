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

const VERTEX_SHADER = `
precision highp float;

attribute vec2 aSeedPos;
attribute vec2 aVelocity;
attribute float aSize;
attribute float aAlphaBase;
attribute float aSpeed;
attribute float aPhase;

uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uVelocityScale;

varying float vAlpha;
varying vec3 vColor;

void main() {
  float t = uTime * 0.001 * uVelocityScale;
  vec2 pos = aSeedPos + aVelocity * aSpeed * t;
  pos = mod(pos, uResolution);

  vec2 clipPos = (pos / uResolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;

  gl_Position = vec4(clipPos, 0.0, 1.0);
  gl_PointSize = max(1.0, aSize);

  float pulse = 0.5 + 0.5 * sin(t * 1.7 + aPhase);
  vColor = uColor;
  vAlpha = clamp((aAlphaBase + pulse * 0.35) * uOpacity, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float alpha = vAlpha * (1.0 - smoothstep(0.4, 0.5, dist));
  gl_FragColor = vec4(vColor, alpha);
}
`;

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function parseCssColor(cssColor) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = cssColor || '#ffffff';
  const computed = ctx.fillStyle;
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
  if (!m) return { r: 1, g: 1, b: 1, a: 1 };
  return {
    r: Number(m[1]) / 255,
    g: Number(m[2]) / 255,
    b: Number(m[3]) / 255,
    a: Number(m[4] ?? 1),
  };
}

function createParticleBufferData(width, height, density, baseSpeed) {
  const baseCount = Math.max(32, Math.round((width * height) / 90000));
  const count = Math.max(8, Math.round(baseCount * Math.min(2.5, 1 + density)));
  const data = new Float32Array(count * 8);

  for (let i = 0; i < count; i++) {
    const valueOffset = i * 8;
    const angle = Math.random() * Math.PI * 2;
    const velocityMag = 0.03 + Math.random() * 0.08;
    const spatialVelocityScale = 0.12; // Match CPU-style particle movement speed in GLSL

    data[valueOffset] = Math.random() * width;
    data[valueOffset + 1] = Math.random() * height;
    data[valueOffset + 2] = Math.cos(angle) * velocityMag * width * spatialVelocityScale;
    data[valueOffset + 3] = Math.sin(angle) * velocityMag * height * spatialVelocityScale;
    data[valueOffset + 4] = randomFloat(1.2, 3.8);
    data[valueOffset + 5] = randomFloat(0.35, 0.95);
    data[valueOffset + 6] = randomFloat(0.9, 1.3) * baseSpeed;
    data[valueOffset + 7] = Math.random() * Math.PI * 2;
  }

  return { count, data };
}

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

        const parsed = parseCssColor(opts.color || '#ffffff');

        gl.viewport(0, 0, opts.width, opts.height);
        gl.useProgram(program);
        gl.uniform2f(locations.uResolution, opts.width, opts.height);
        gl.uniform3f(locations.uColor, parsed.r, parsed.g, parsed.b);
        gl.uniform1f(locations.uOpacity, opts.opacity * parsed.a);
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





