"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function setGpuCanvas(canvas) {
  canvasElementsState.gpuCanvas = canvas;
}
