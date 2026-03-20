"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function setFillLayerCanvas(canvas) {
  canvasElementsState.fillLayerCanvas = canvas;
}
