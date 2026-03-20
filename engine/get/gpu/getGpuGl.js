"use strict";
import { glState } from '@engine/state/gpu/glState.js';
export function getGpuGl() {
  return glState.gpuGl;
}
