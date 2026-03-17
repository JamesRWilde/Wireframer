import { program }from '@engine/init/gpu/create/program.js';

export function scenePrograms(gl) {
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
    vec3 applyRot(vec3 v) {
      return vec3(dot(u_r0, v), dot(u_r1, v), dot(u_r2, v));
    }
    void main() {
      vec3 p = applyRot(a_pos);
      vec3 n = normalize(applyRot(a_normal));
      float d = p.z + 3.0;
      gl_Position = vec4(p.x * u_projX / d, (p.y - u_modelCy) * u_projY / d, clamp(p.z * u_depthScale, -1.0, 1.0), 1.0);
      v_normal = n;
      v_uv = a_uv;
    }
  `;

  const fillFragSrc = `
    precision mediump float;
    uniform vec3 u_lightDir;
    uniform vec3 u_viewDir;
    uniform vec3 u_shadeDark;
    uniform vec3 u_shadeBright;
    uniform float u_alpha;
    varying vec3 v_normal;
    void main() {
      vec3 n = normalize(v_normal);
      float ndotl = max(0.0, dot(n, u_lightDir));
      vec3 h = normalize(u_lightDir + u_viewDir);
      float nh = max(0.0, dot(n, h));
      float spec = pow(nh, 24.0);
      float lit = clamp(0.26 + 0.72 * ndotl + 0.18 * spec, 0.0, 1.0);
      vec3 color = mix(u_shadeDark, u_shadeBright, lit);
      gl_FragColor = vec4(color, u_alpha);
    }
  `;

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
      float d = p.z + 3.0;
      gl_Position = vec4(p.x * u_projX / d, (p.y - u_modelCy) * u_projY / d, clamp(p.z * u_depthScale, -1.0, 1.0), 1.0);
      float denom = max(0.0001, u_zHalf * 2.0);
      v_t = clamp((u_zHalf - p.z) / denom, 0.0, 0.999);
    }
  `;

  const wireFragSrc = `
    precision mediump float;
    uniform vec3 u_wireNear;
    uniform vec3 u_wireFar;
    uniform float u_alpha;
    varying float v_t;
    void main() {
      vec3 c = mix(u_wireNear, u_wireFar, 0.2 + v_t * 0.8);
      float edgeAlpha = (0.06 + pow(v_t, 1.35) * 0.94) * u_alpha;
      gl_FragColor = vec4(c, edgeAlpha);
    }
  `;

  const fillProgram = program(gl, fillVertSrc, fillFragSrc);
  const wireProgram = program(gl, wireVertSrc, wireFragSrc);

  const fillLoc = {
    aPos: gl.getAttribLocation(fillProgram, 'a_pos'),
    aNormal: gl.getAttribLocation(fillProgram, 'a_normal'),
    aUV: gl.getAttribLocation(fillProgram, 'a_uv'),
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

  const wireLoc = {
    aPos: gl.getAttribLocation(wireProgram, 'a_pos'),
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

  return {
    fillProgram,
    wireProgram,
    fillLoc,
    wireLoc,
    dispose() {
      gl.deleteProgram(fillProgram);
      gl.deleteProgram(wireProgram);
    },
  };
}
