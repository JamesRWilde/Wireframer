export function createSceneGpuDraw(gl, canvas, shaderPack, bufferStore) {
  const IDENTITY3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const tmpLight = new Float32Array(3);
  const tmpView = new Float32Array(3);
  const tmpShadeDark = new Float32Array(3);
  const tmpShadeBright = new Float32Array(3);
  const tmpWireNear = new Float32Array(3);
  const tmpWireFar = new Float32Array(3);

  const { fillProgram, wireProgram, fillLoc, wireLoc } = shaderPack;
  const { getModelBuffers, updateDynamicBuffers } = bufferStore;

  function fillNormalized3(out, v, fallback) {
    const x = Number(v && v[0]);
    const y = Number(v && v[1]);
    const z = Number(v && v[2]);
    const l = Math.hypot(x, y, z);
    if (!Number.isFinite(l) || l < 1e-6) {
      out[0] = fallback[0]; out[1] = fallback[1]; out[2] = fallback[2];
      return out;
    }
    out[0] = x / l; out[1] = y / l; out[2] = z / l;
    return out;
  }

  function fillColor01(out, rgb, fallback) {
    const src = rgb || fallback;
    out[0] = (src[0] || 0) / 255;
    out[1] = (src[1] || 0) / 255;
    out[2] = (src[2] || 0) / 255;
    return out;
  }

  function toRowMajorRotation(m) {
    return Array.isArray(m) && m.length === 9 ? m : IDENTITY3;
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
      // Engine-owned mesh only
      const buffers = getModelBuffers(model);
    if (!buffers) return false;

    if (params.dynamic === true && !updateDynamicBuffers(model, buffers)) return false;

    const rot = toRowMajorRotation(params.rotation);
    gl.viewport(0, 0, params.width, params.height);
    if (params.clear !== false) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Note: Backface culling disabled for proper OBJ support
    // OBJ files can have mixed winding, double-sided faces, or complex geometry
    // Rely on depth sorting (painter's algorithm) instead
    gl.disable(gl.CULL_FACE);

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
      // If UVs are present, bind them (future-proof for textureless UV debug)
      if (buffers.fillUVBuffer && fillLoc.aUV !== undefined) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillUVBuffer);
        gl.enableVertexAttribArray(fillLoc.aUV);
        gl.vertexAttribPointer(fillLoc.aUV, 2, gl.FLOAT, false, 0, 0);
      }

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

  return { renderModel, clear };
}
