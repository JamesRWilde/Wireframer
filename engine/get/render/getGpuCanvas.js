"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function getGpuCanvas() {
  return canvasElementsState.gpuCanvas;
}
