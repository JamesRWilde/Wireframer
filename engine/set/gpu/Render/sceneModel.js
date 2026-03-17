import { normalizeVector3 } from "'./GetGpuEngineNormalizeVector3.js";
import { convertRgbToNormalized } from "./GetGpuEngineConvertRgbToNormalized.js";
import { toRowMajorRotation } from "./GetGpuEngineToRowMajorRotation.js";
import { projectionUniforms } from "./scene/projectionUniforms.js'";

export function sceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  if (!params?.theme || !params?.width || !params?.height) return false;
  
  const buffers = bufferStore.GetGpuEngineModelBuffers(model);
  if (!buffers) return false;

  if (params.dynamic === true && !bufferStore.SetGpuEngineUpdateDynamicBuffers(model, buffers)) return false;

  const rot = GetGpuEngineToRowMajorRotation(params.rotation);
  gl.viewport(0, 0, params.width, params.height);
  if (params.clear !== false) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);

  const { fillProgram, wireProgram, fillLoc, wireLoc } = shaderPack;
  const { tmpLight, tmpView, tmpShadeDark, tmpShadeBright, tmpWireNear, tmpWireFar } = tmpArrays;
  const fillAlpha = Math.max(0, Math.min(1, Number(params.fillAlpha) || 0));
  const wireAlpha = Math.max(0, Math.min(1, Number(params.wireAlpha) || 0));

  if (fillAlpha > 0.001) {
    gl.useProgram(fillProgram);
    SetGpuEngineProjectionUniforms(gl, fillLoc, params);
    gl.uniform3f(fillLoc.uR0, rot[0], rot[1], rot[2]);
    gl.uniform3f(fillLoc.uR1, rot[3], rot[4], rot[5]);
    gl.uniform3f(fillLoc.uR2, rot[6], rot[7], rot[8]);
    gl.uniform3fv(fillLoc.uLightDir, GetGpuEngineNormalizeVector3(tmpLight, params.lightDir, [-0.38, 0.74, -0.56]));
    gl.uniform3fv(fillLoc.uViewDir, GetGpuEngineNormalizeVector3(tmpView, params.viewDir, [0, 0, -1]));
    gl.uniform3fv(fillLoc.uShadeDark, GetGpuEngineConvertRgbToNormalized(tmpShadeDark, params.theme.shadeDark, [35, 48, 64]));
    gl.uniform3fv(fillLoc.uShadeBright, GetGpuEngineConvertRgbToNormalized(tmpShadeBright, params.theme.shadeBright, [120, 180, 230]));
    gl.uniform1f(fillLoc.uAlpha, fillAlpha);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
    gl.enableVertexAttribArray(fillLoc.aPos);
    gl.vertexAttribPointer(fillLoc.aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
    gl.enableVertexAttribArray(fillLoc.aNormal);
    gl.vertexAttribPointer(fillLoc.aNormal, 3, gl.FLOAT, false, 0, 0);

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
    SetGpuEngineProjectionUniforms(gl, wireLoc, params);
    gl.uniform3f(wireLoc.uR0, rot[0], rot[1], rot[2]);
    gl.uniform3f(wireLoc.uR1, rot[3], rot[4], rot[5]);
    gl.uniform3f(wireLoc.uR2, rot[6], rot[7], rot[8]);
    gl.uniform1f(wireLoc.uZHalf, Math.max(0.01, params.zHalf || 1));
    gl.uniform3fv(wireLoc.uWireNear, GetGpuEngineConvertRgbToNormalized(tmpWireNear, params.theme.wireNear, [210, 245, 255]));
    gl.uniform3fv(wireLoc.uWireFar, GetGpuEngineConvertRgbToNormalized(tmpWireFar, params.theme.wireFar, [120, 195, 255]));
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
