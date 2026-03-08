'use strict';

let SCENE_GPU = null;
let SCENE_GPU_FAILED = false;

function createSceneGpuRenderer(canvas) {
  if (!canvas) return null;

  const glOpts = {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    desynchronized: true,
    powerPreference: 'high-performance',
  };

  const gl =
    canvas.getContext('webgl2', glOpts) ||
    canvas.getContext('webgl', glOpts) ||
    canvas.getContext('experimental-webgl', glOpts);

  if (!gl) return null;

  const supportsUint32 = !!gl.getExtension('OES_element_index_uint') || (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext);

  const fillVertSrc = `
    attribute vec3 a_pos;
    attribute vec3 a_normal;

    uniform vec3 u_r0;
    uniform vec3 u_r1;
    uniform vec3 u_r2;
    uniform float u_projX;
    uniform float u_projY;
    uniform float u_modelCy;
    uniform float u_depthScale;

    varying vec3 v_normal;

    vec3 applyRot(vec3 v) {
      return vec3(
        dot(u_r0, v),
        dot(u_r1, v),
        dot(u_r2, v)
      );
    }

    void main() {
      vec3 p = applyRot(a_pos);
      vec3 n = normalize(applyRot(a_normal));
      float d = p.z + 3.0;

      gl_Position = vec4(
        p.x * u_projX / d,
        (p.y - u_modelCy) * u_projY / d,
        clamp(p.z * u_depthScale, -1.0, 1.0),
        1.0
      );

      v_normal = n;
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

      float ambient = 0.26;
      float diffuse = 0.72 * ndotl;
      float specular = 0.18 * spec;
      float lit = clamp(ambient + diffuse + specular, 0.0, 1.0);

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
      return vec3(
        dot(u_r0, v),
        dot(u_r1, v),
        dot(u_r2, v)
      );
    }

    void main() {
      vec3 p = applyRot(a_pos);
      float d = p.z + 3.0;

      gl_Position = vec4(
        p.x * u_projX / d,
        (p.y - u_modelCy) * u_projY / d,
        clamp(p.z * u_depthScale, -1.0, 1.0),
        1.0
      );

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

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Scene GPU shader compile failed: ${info}`);
    }
    return shader;
  }

  function createProgram(vs, fs) {
    const v = compileShader(gl.VERTEX_SHADER, vs);
    const f = compileShader(gl.FRAGMENT_SHADER, fs);

    const program = gl.createProgram();
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);

    gl.deleteShader(v);
    gl.deleteShader(f);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Scene GPU program link failed: ${info}`);
    }

    return program;
  }

  let fillProgram;
  let wireProgram;
  const modelCache = new WeakMap();

  try {
    fillProgram = createProgram(fillVertSrc, fillFragSrc);
    wireProgram = createProgram(wireVertSrc, wireFragSrc);
  } catch (err) {
    console.warn(err);
    return null;
  }

  const fillLoc = {
    aPos: gl.getAttribLocation(fillProgram, 'a_pos'),
    aNormal: gl.getAttribLocation(fillProgram, 'a_normal'),
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

  const IDENTITY3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const tmpLight = new Float32Array(3);
  const tmpView = new Float32Array(3);
  const tmpShadeDark = new Float32Array(3);
  const tmpShadeBright = new Float32Array(3);
  const tmpWireNear = new Float32Array(3);
  const tmpWireFar = new Float32Array(3);

  function fillNormalized3(out, v, fallback) {
    const x = Number(v && v[0]);
    const y = Number(v && v[1]);
    const z = Number(v && v[2]);
    const l = Math.hypot(x, y, z);
    if (!Number.isFinite(l) || l < 1e-6) {
      out[0] = fallback[0];
      out[1] = fallback[1];
      out[2] = fallback[2];
      return out;
    }
    out[0] = x / l;
    out[1] = y / l;
    out[2] = z / l;
    return out;
  }

  function fillColor01(out, rgb, fallback) {
    const src = rgb || fallback;
    out[0] = (src[0] || 0) / 255;
    out[1] = (src[1] || 0) / 255;
    out[2] = (src[2] || 0) / 255;
    return out;
  }

  function buildModelBuffers(model) {
    if (!model || !model.V || !model.V.length || !model.E || !model.E.length) return null;

    if (!model._triFaces) model._triFaces = getModelTriangles(model);
    const triFaces = model._triFaces;
    if (!triFaces.length) return null;

    const triCornerNormals = getModelTriCornerNormals(model, triFaces);
    if (!triCornerNormals || triCornerNormals.length !== triFaces.length) return null;

    const vertexCount = model.V.length;
    const triIndexCount = triFaces.length * 3;
    const edgeIndexCount = model.E.length * 2;
    const fillVertexCount = triFaces.length * 3;

    if (vertexCount > 65535 && !supportsUint32) return null;

    const wirePosData = new Float32Array(vertexCount * 3);
    const fillPosData = new Float32Array(fillVertexCount * 3);
    const fillNormalData = new Float32Array(fillVertexCount * 3);
    const fillSourceIndex = new Uint32Array(fillVertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const v = model.V[i];
      const o = i * 3;
      wirePosData[o] = v[0];
      wirePosData[o + 1] = v[1];
      wirePosData[o + 2] = v[2];
    }

    for (let i = 0; i < triFaces.length; i++) {
      const tri = triFaces[i];
      const cn = triCornerNormals[i];
      for (let c = 0; c < 3; c++) {
        const src = tri[c];
        const v = model.V[src];
        const n = cn[c];
        const o = (i * 3 + c) * 3;
        fillPosData[o] = v[0];
        fillPosData[o + 1] = v[1];
        fillPosData[o + 2] = v[2];
        fillNormalData[o] = n[0];
        fillNormalData[o + 1] = n[1];
        fillNormalData[o + 2] = n[2];
        fillSourceIndex[i * 3 + c] = src;
      }
    }

    const indexType = vertexCount > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    const edgeData = vertexCount > 65535 ? new Uint32Array(edgeIndexCount) : new Uint16Array(edgeIndexCount);

    for (let i = 0; i < model.E.length; i++) {
      const e = model.E[i];
      const o = i * 2;
      edgeData[o] = e[0];
      edgeData[o + 1] = e[1];
    }

    const wirePosBuffer = gl.createBuffer();
    const fillPosBuffer = gl.createBuffer();
    const fillNormalBuffer = gl.createBuffer();
    const edgeIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, wirePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wirePosData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, fillPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillPosData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, fillNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillNormalData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edgeData, gl.STATIC_DRAW);

    return {
      wirePosBuffer,
      fillPosBuffer,
      fillNormalBuffer,
      edgeIndexBuffer,
      triCount: triIndexCount,
      fillVertexCount,
      edgeCount: edgeData.length,
      indexType,
      vertexCount,
      fillSourceIndex,
      wirePosData,
      fillPosData,
      fillNormalData,
    };
  }

  function updateDynamicBuffers(model, buffers) {
    const vertexCount = buffers.vertexCount;
    if (!model || !model.V || model.V.length !== vertexCount) return false;

    if (!model._triFaces) model._triFaces = getModelTriangles(model);
    const triFaces = model._triFaces;
    const cornerNormals = getModelTriCornerNormals(model, triFaces);
    if (!cornerNormals || cornerNormals.length !== triFaces.length) return false;

    const wirePosData = buffers.wirePosData;
    const fillPosData = buffers.fillPosData;
    const fillNormalData = buffers.fillNormalData;
    const fillSourceIndex = buffers.fillSourceIndex;

    for (let i = 0; i < vertexCount; i++) {
      const v = model.V[i];
      const o = i * 3;
      wirePosData[o] = v[0];
      wirePosData[o + 1] = v[1];
      wirePosData[o + 2] = v[2];
    }

    for (let i = 0; i < buffers.fillVertexCount; i++) {
      const src = fillSourceIndex[i];
      const v = model.V[src];
      const triIdx = Math.floor(i / 3);
      const corner = i % 3;
      const n = cornerNormals[triIdx][corner];
      const o = i * 3;
      fillPosData[o] = v[0];
      fillPosData[o + 1] = v[1];
      fillPosData[o + 2] = v[2];
      fillNormalData[o] = n[0];
      fillNormalData[o + 1] = n[1];
      fillNormalData[o + 2] = n[2];
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wirePosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, wirePosData);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, fillPosData);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, fillNormalData);

    return true;
  }

  function getModelBuffers(model) {
    const existing = modelCache.get(model);
    if (existing) return existing;
    const built = buildModelBuffers(model);
    if (!built) return null;
    modelCache.set(model, built);
    return built;
  }

  function toRowMajorRotation(m) {
    if (!Array.isArray(m) || m.length !== 9) {
      return IDENTITY3;
    }
    return m;
  }

  function setProjectionUniforms(programLoc, params) {
    const minDim = Math.min(params.width, params.height);
    const fov = minDim * 0.90 * params.zoom;
    const projX = (2 * fov) / Math.max(1, params.width);
    const projY = (2 * fov) / Math.max(1, params.height);
    const depthScale = 1 / Math.max(1.5, params.zHalf * 2.5);

    gl.uniform1f(programLoc.uProjX, projX);
    gl.uniform1f(programLoc.uProjY, projY);
    gl.uniform1f(programLoc.uModelCy, params.modelCy || 0);
    gl.uniform1f(programLoc.uDepthScale, depthScale);
  }

  function renderModel(model, params) {
    if (!params || !params.theme || !params.width || !params.height) return false;
    const buffers = getModelBuffers(model);
    if (!buffers) return false;

    if (params.dynamic === true && !updateDynamicBuffers(model, buffers)) {
      return false;
    }

    const rot = toRowMajorRotation(params.rotation);

    gl.viewport(0, 0, params.width, params.height);
    if (params.clear !== false) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const fillAlpha = Math.max(0, Math.min(1, Number(params.fillAlpha) || 0));
    const wireAlpha = Math.max(0, Math.min(1, Number(params.wireAlpha) || 0));

    if (fillAlpha > 0.001) {
      gl.useProgram(fillProgram);
      setProjectionUniforms(fillLoc, params);
      gl.uniform3f(fillLoc.uR0, rot[0], rot[1], rot[2]);
      gl.uniform3f(fillLoc.uR1, rot[3], rot[4], rot[5]);
      gl.uniform3f(fillLoc.uR2, rot[6], rot[7], rot[8]);

      gl.uniform3fv(fillLoc.uLightDir, fillNormalized3(tmpLight, params.lightDir, [-0.38, 0.74, -0.56]));
      gl.uniform3fv(fillLoc.uViewDir, fillNormalized3(tmpView, params.viewDir, [0, 0, -1]));
      gl.uniform3fv(fillLoc.uShadeDark, fillColor01(tmpShadeDark, params.theme.shadeDark, [35, 48, 64]));
      gl.uniform3fv(fillLoc.uShadeBright, fillColor01(tmpShadeBright, params.theme.shadeBright, [120, 180, 230]));
      gl.uniform1f(fillLoc.uAlpha, fillAlpha);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
      gl.enableVertexAttribArray(fillLoc.aPos);
      gl.vertexAttribPointer(fillLoc.aPos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
      gl.enableVertexAttribArray(fillLoc.aNormal);
      gl.vertexAttribPointer(fillLoc.aNormal, 3, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, buffers.fillVertexCount);
    }

    if (wireAlpha > 0.001) {
      gl.useProgram(wireProgram);
      setProjectionUniforms(wireLoc, params);
      gl.uniform3f(wireLoc.uR0, rot[0], rot[1], rot[2]);
      gl.uniform3f(wireLoc.uR1, rot[3], rot[4], rot[5]);
      gl.uniform3f(wireLoc.uR2, rot[6], rot[7], rot[8]);
      gl.uniform1f(wireLoc.uZHalf, Math.max(0.01, params.zHalf || 1));
      gl.uniform3fv(wireLoc.uWireNear, fillColor01(tmpWireNear, params.theme.wireNear, [210, 245, 255]));
      gl.uniform3fv(wireLoc.uWireFar, fillColor01(tmpWireFar, params.theme.wireFar, [120, 195, 255]));
      gl.uniform1f(wireLoc.uAlpha, wireAlpha);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wirePosBuffer);
      gl.enableVertexAttribArray(wireLoc.aPos);
      gl.vertexAttribPointer(wireLoc.aPos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.edgeIndexBuffer);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawElements(gl.LINES, buffers.edgeCount, buffers.indexType, 0);
    }

    return true;
  }

  function clear() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function dispose() {
    if (fillProgram) gl.deleteProgram(fillProgram);
    if (wireProgram) gl.deleteProgram(wireProgram);
  }

  return {
    mode: 'gpu-scene',
    renderModel,
    clear,
    dispose,
  };
}

function getSceneGpuRenderer() {
  if (SCENE_GPU || SCENE_GPU_FAILED) return SCENE_GPU;
  if (!fgCanvas) {
    SCENE_GPU_FAILED = true;
    return null;
  }

  SCENE_GPU = createSceneGpuRenderer(fgCanvas);
  if (!SCENE_GPU) SCENE_GPU_FAILED = true;
  return SCENE_GPU;
}

function disableSceneGpuRenderer(err) {
  if (SCENE_GPU && typeof SCENE_GPU.dispose === 'function') {
    try {
      SCENE_GPU.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }
  SCENE_GPU = null;
  SCENE_GPU_FAILED = true;
  console.warn('Wireframer: GPU scene renderer disabled, falling back to 2D.', err);
}

function drawGpuSceneModel(model, params) {
  const renderer = getSceneGpuRenderer();
  if (!renderer) return false;

  try {
    return renderer.renderModel(model, params);
  } catch (err) {
    disableSceneGpuRenderer(err);
    return false;
  }
}

function clearGpuSceneCanvas() {
  const renderer = getSceneGpuRenderer();
  if (!renderer || typeof renderer.clear !== 'function') return;

  try {
    renderer.clear();
  } catch (err) {
    disableSceneGpuRenderer(err);
  }
}
