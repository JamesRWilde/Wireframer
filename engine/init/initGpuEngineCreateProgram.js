import { initGpuEngineCompileShader } from './initGpuEngineCompileShader.js';

export function initGpuEngineCreateProgram(gl, vs, fs) {
  const v = InitGpuEngineCompileShader(gl, gl.VERTEX_SHADER, vs);
  const f = InitGpuEngineCompileShader(gl, gl.FRAGMENT_SHADER, fs);
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
