/**
 * scenePrograms.js - GPU Shader Program Collection
 *
 * PURPOSE:
 *   Creates and links the complete set of GPU shader programs needed for
 *   scene rendering: fill shaders (with Blinn-Phong lighting) and wire
 *   shaders (with depth-based color interpolation). Also resolves all
 *   attribute and uniform locations for efficient per-frame updates.
 *
 * ARCHITECTURE ROLE:
 *   Called by sceneRenderer during GPU initialization. Returns a packed
 *   object with compiled programs and their location maps, consumed by
 *   the scene draw pipeline.
 *
 * SHADERS PROVIDED:
 *   - fillProgram: Vertex + fragment for solid triangle fill with lighting
 *   - wireProgram: Vertex + fragment for edge wireframe with depth fading
 */

"use strict";

// Import program linker to compile and link shader programs
import { createProgram }from '@engine/init/gpu/create/createProgram.js';

/**
 * scenePrograms - Creates all GPU shader programs for scene rendering
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @returns {Object} Shader pack with { fillProgram, wireProgram, fillLoc, wireLoc, dispose }
 *   fillLoc/wireLoc are objects mapping uniform/attribute names to GL locations
 */

// Cache for compiled shaders to avoid redundant compilation
// - Uses WeakMap keyed by WebGLRenderingContext to avoid retaining old contexts
// - Stores the full shaderPack object (including uniform locations), not just program handles
const shaderCache = new WeakMap();

export function createScenePrograms(gl) {
  // Return cached shader pack if already built for this GL context
  if (shaderCache.has(gl)) {
    return shaderCache.get(gl);
  }

  // --- Fill Shader (Blinn-Phong lighting with per-triangle normals) ---
  const fillVertSrc = `
    attribute vec3 a_pos;
    attribute vec3 a_normal;
    attribute vec2 a_uv;
    uniform vec3 u_r0;
    uniform vec3 u_r1;
    uniform vec3 u_r2;
    uniform float u_projX;
    uniform float u_projY;
    uniform float u_modelCy;
    uniform float u_depthScale;
    varying vec3 v_normal;
    varying vec2 v_uv;
    // Apply 3x3 rotation matrix stored as three row vectors
    vec3 applyRot(vec3 v) {
      return vec3(dot(u_r0, v), dot(u_r1, v), dot(u_r2, v));
    }
    void main() {
      vec3 p = applyRot(a_pos);
      vec3 n = normalize(applyRot(a_normal));
      // Orthographic projection: no depth-dependent scaling
      gl_Position = vec4(p.x * u_projX, (p.y - u_modelCy) * u_projY, clamp(p.z * u_depthScale, -1.0, 1.0), 1.0);
      v_normal = n;
      v_uv = a_uv;
    }
  `;

  const fillFragSrc = `
    precision mediump float; // Reduced precision for better compatibility
    uniform vec3 u_lightDir;
    uniform vec3 u_shadeDark;
    uniform vec3 u_shadeBright;
    uniform float u_alpha;
    varying vec3 v_normal;
    void main() {
      vec3 n = normalize(v_normal);
      float ndotl = max(0.0, dot(n, u_lightDir));
      vec3 color = mix(u_shadeDark, u_shadeBright, ndotl);
      gl_FragColor = vec4(color, u_alpha);
    }
  `;

  // Compile and link both shader programs
  const fillProgram = createProgram(gl, fillVertSrc, fillFragSrc);

  // --- Wire Shader (depth-based color interpolation) ---
  const wireVertSrc = `
    attribute vec3 a_pos;
    uniform vec3 u_r0;
    uniform vec3 u_r1;
    uniform vec3 u_r2;
    uniform float u_projX;
    uniform float u_projY;
    uniform float u_modelCy;
    uniform float u_zHalf;
    uniform float u_depthScale;
    varying float v_t;
    vec3 applyRot(vec3 v) {
      return vec3(dot(u_r0, v), dot(u_r1, v), dot(u_r2, v));
    }
    void main() {
      vec3 p = applyRot(a_pos);
      // Orthographic projection: no depth-dependent scaling
      gl_Position = vec4(p.x * u_projX, (p.y - u_modelCy) * u_projY, clamp(p.z * u_depthScale, -1.0, 1.0), 1.0);
      // Compute depth-based interpolation factor for color fading
      float denom = max(0.0001, u_zHalf * 2.0);
      v_t = clamp((u_zHalf - p.z) / denom, 0.0, 0.999);
    }
  `;

  const wireFragSrc = `
    precision mediump float; // Reduced precision for better compatibility
    uniform vec3 u_wireNear;
    uniform vec3 u_wireFar;
    uniform float u_alpha;
    varying float v_t;
    void main() {
      // Interpolate wire color based on depth (v_t) for a subtle fade effect
      vec3 color = mix(u_wireNear, u_wireFar, v_t);
      gl_FragColor = vec4(color, u_alpha);
    }
  `;

  const wireProgram = createProgram(gl, wireVertSrc, wireFragSrc);

  // Look up uniform and attribute locations for fill shader
  const fillLoc = {
    // Attributes
    aPos: gl.getAttribLocation(fillProgram, 'a_pos'),
    aNormal: gl.getAttribLocation(fillProgram, 'a_normal'),
    aUV: gl.getAttribLocation(fillProgram, 'a_uv'),
    // Uniforms
    uR0: gl.getUniformLocation(fillProgram, 'u_r0'),
    uR1: gl.getUniformLocation(fillProgram, 'u_r1'),
    uR2: gl.getUniformLocation(fillProgram, 'u_r2'),
    uProjX: gl.getUniformLocation(fillProgram, 'u_projX'),
    uProjY: gl.getUniformLocation(fillProgram, 'u_projY'),
    uModelCy: gl.getUniformLocation(fillProgram, 'u_modelCy'),
    uDepthScale: gl.getUniformLocation(fillProgram, 'u_depthScale'),
    uLightDir: gl.getUniformLocation(fillProgram, 'u_lightDir'),
    uViewDir: gl.getUniformLocation(fillProgram, 'u_viewDir'),
    uShadeDark: gl.getUniformLocation(fillProgram, 'u_shadeDark'),
    uShadeBright: gl.getUniformLocation(fillProgram, 'u_shadeBright'),
    uAlpha: gl.getUniformLocation(fillProgram, 'u_alpha'),
  };

  // Look up uniform and attribute locations for wire shader
  const wireLoc = {
    // Attributes
    aPos: gl.getAttribLocation(wireProgram, 'a_pos'),
    // Uniforms
    uR0: gl.getUniformLocation(wireProgram, 'u_r0'),
    uR1: gl.getUniformLocation(wireProgram, 'u_r1'),
    uR2: gl.getUniformLocation(wireProgram, 'u_r2'),
    uProjX: gl.getUniformLocation(wireProgram, 'u_projX'),
    uProjY: gl.getUniformLocation(wireProgram, 'u_projY'),
    uModelCy: gl.getUniformLocation(wireProgram, 'u_modelCy'),
    uZHalf: gl.getUniformLocation(wireProgram, 'u_zHalf'),
    uDepthScale: gl.getUniformLocation(wireProgram, 'u_depthScale'),
    uWireNear: gl.getUniformLocation(wireProgram, 'u_wireNear'),
    uWireFar: gl.getUniformLocation(wireProgram, 'u_wireFar'),
    uAlpha: gl.getUniformLocation(wireProgram, 'u_alpha'),
  };

  // Build the shader pack and cache it so we don't recompile shaders every time
  const shaderPack = {
    fillProgram,
    wireProgram,
    fillLoc,
    wireLoc,
    /**
     * dispose - Deletes GPU shader programs to free resources
     */
    dispose() {
      gl.deleteProgram(fillProgram);
      gl.deleteProgram(wireProgram);
      // Remove from cache so a new shader pack will be created if the GL context is reinitialized
      shaderCache.delete(gl);
    },
  };

  shaderCache.set(gl, shaderPack);

  return shaderPack;
}
