"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function setFgCanvas(canvas) {
  canvasElementsState.fgCanvas = canvas;
}
