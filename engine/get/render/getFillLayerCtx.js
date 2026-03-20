"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function getFillLayerCtx() {
  return canvasElementsState.fillLayerCtx;
}
