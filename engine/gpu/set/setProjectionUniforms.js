export function setProjectionUniforms(gl, programLoc, params) {
  const minDim = Math.min(params.width, params.height);
  const fov = minDim * 0.9 * params.zoom;
  const projX = (2 * fov) / Math.max(1, params.width);
  const projY = (2 * fov) / Math.max(1, params.height);
  const depthScale = 1 / Math.max(1.5, params.zHalf * 2.5);
  gl.uniform1f(programLoc.uProjX, projX);
  gl.uniform1f(programLoc.uProjY, projY);
  gl.uniform1f(programLoc.uModelCy, params.modelCy ?? 0);
  gl.uniform1f(programLoc.uDepthScale, depthScale);
}
