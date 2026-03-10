'use strict';

function createGpuBackgroundRenderer(canvas) {
  if (!canvas) return null;

  const glOpts = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    desynchronized: true,
    powerPreference: 'high-performance',
    antialias: false,
  };

  const gl =
    canvas.getContext('webgl2', glOpts) ||
    canvas.getContext('webgl', glOpts) ||
    canvas.getContext('experimental-webgl', glOpts);

  if (!gl) return null;

  const vertSrc = `
    attribute vec2 a_seedPos;
    attribute vec2 a_vel;
    attribute float a_size;
    attribute float a_alphaBase;
    attribute float a_speed;
    attribute float a_phase;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_velocityScale;
    uniform float u_opacityScale;

    varying float v_alpha;

    void main() {
      vec2 pos = a_seedPos + a_vel * (u_time * 60.0) * u_velocityScale;
      vec2 wrapSize = u_resolution + vec2(4.0, 4.0);
      vec2 wrapped = mod(pos + vec2(2.0, 2.0), wrapSize) - vec2(2.0, 2.0);

      float pulse = 0.5 + 0.5 * sin(u_time * a_speed + a_phase);
      float alpha = (a_alphaBase + pulse * 0.14) * u_opacityScale;

      vec2 zeroToOne = wrapped / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clip = zeroToTwo - 1.0;

      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      gl_PointSize = a_size * 2.0;
      v_alpha = clamp(alpha, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;

    uniform vec3 u_color;
    varying float v_alpha;

    void main() {
      vec2 uv = gl_PointCoord * 2.0 - 1.0;
      float r2 = dot(uv, uv);
      if (r2 > 1.0) discard;

      // Soft circular falloff.
      float falloff = smoothstep(1.0, 0.0, sqrt(r2));
      gl_FragColor = vec4(u_color, v_alpha * falloff);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Background GPU shader compile failed: ${info}`);
    }
    return shader;
  }

  let program;
  let seedPosLoc;
  let velLoc;
  let sizeLoc;
  let alphaBaseLoc;
  let speedLoc;
  let phaseLoc;
  let resLoc;
  let timeLoc;
  let velocityScaleLoc;
  let opacityScaleLoc;
  let colorLoc;
  let buffer;

  try {
    const vert = compile(gl.VERTEX_SHADER, vertSrc);
    const frag = compile(gl.FRAGMENT_SHADER, fragSrc);

    program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    gl.deleteShader(vert);
    gl.deleteShader(frag);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`Background GPU program link failed: ${info}`);
    }

    seedPosLoc = gl.getAttribLocation(program, 'a_seedPos');
    velLoc = gl.getAttribLocation(program, 'a_vel');
    sizeLoc = gl.getAttribLocation(program, 'a_size');
    alphaBaseLoc = gl.getAttribLocation(program, 'a_alphaBase');
    speedLoc = gl.getAttribLocation(program, 'a_speed');
    phaseLoc = gl.getAttribLocation(program, 'a_phase');
    resLoc = gl.getUniformLocation(program, 'u_resolution');
    timeLoc = gl.getUniformLocation(program, 'u_time');
    velocityScaleLoc = gl.getUniformLocation(program, 'u_velocityScale');
    opacityScaleLoc = gl.getUniformLocation(program, 'u_opacityScale');
    colorLoc = gl.getUniformLocation(program, 'u_color');

    buffer = gl.createBuffer();
  } catch (err) {
    console.warn(err);
    return null;
  }

  let data = new Float32Array(0);
  let cachedCount = -1;
  let cachedFirst = null;
  let cachedLast = null;

  function needsRebuild(particles) {
    const count = particles.length;
    if (count !== cachedCount) return true;
    if (count === 0) return false;

    const first = particles[0];
    const last = particles[count - 1];
    return first !== cachedFirst || last !== cachedLast;
  }

  function rebuildBuffer(particles) {
    const count = particles.length;
    const strideFloats = 8;
    const required = count * strideFloats;
    if (data.length !== required) data = new Float32Array(required);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const o = i * strideFloats;
      data[o] = p.x;
      data[o + 1] = p.y;
      data[o + 2] = p.vx;
      data[o + 3] = p.vy;
      data[o + 4] = p.size;
      data[o + 5] = p.alphaBase;
      data[o + 6] = p.speed;
      data[o + 7] = p.phase;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    cachedCount = count;
    cachedFirst = count > 0 ? particles[0] : null;
    cachedLast = count > 0 ? particles[count - 1] : null;
  }

  function render(params) {
    if (!params || !params.particles) return;
    if (gl.isContextLost && gl.isContextLost()) throw new Error('Background GPU context lost.');

    const { width, height, particles, bg, color, lightMode, timeSec, velocityScale, opacityScale } = params;
    const count = particles.length;
    if (needsRebuild(particles)) rebuildBuffer(particles);

    gl.viewport(0, 0, width, height);
    gl.clearColor(bg[0] / 255, bg[1] / 255, bg[2] / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform2f(resLoc, width, height);
    gl.uniform1f(timeLoc, timeSec || 0);
    gl.uniform1f(velocityScaleLoc, Math.max(0, velocityScale || 0));
    gl.uniform1f(opacityScaleLoc, Math.max(0, opacityScale || 0));
    gl.uniform3f(colorLoc, color[0] / 255, color[1] / 255, color[2] / 255);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const stride = 32;
    gl.enableVertexAttribArray(seedPosLoc);
    gl.vertexAttribPointer(seedPosLoc, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(velLoc);
    gl.vertexAttribPointer(velLoc, 2, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 16);
    gl.enableVertexAttribArray(alphaBaseLoc);
    gl.vertexAttribPointer(alphaBaseLoc, 1, gl.FLOAT, false, stride, 20);
    gl.enableVertexAttribArray(speedLoc);
    gl.vertexAttribPointer(speedLoc, 1, gl.FLOAT, false, stride, 24);
    gl.enableVertexAttribArray(phaseLoc);
    gl.vertexAttribPointer(phaseLoc, 1, gl.FLOAT, false, stride, 28);

    gl.enable(gl.BLEND);
    if (lightMode) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    gl.drawArrays(gl.POINTS, 0, count);
  }

  function dispose() {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
  }

  return { mode: 'gpu', render, dispose };
}
