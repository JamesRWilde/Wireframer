"use strict";
import { glState } from '@engine/state/gpu/glState.js';
export function setGpuGl(gl) {
  glState.gpuGl = gl;
}
