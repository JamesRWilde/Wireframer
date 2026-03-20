"use strict";
import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';
export function setFillLayerCtx(ctx) {
  canvasElementsState.fillLayerCtx = ctx;
}
