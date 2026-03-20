'use strict';
import { zoomState } from '@engine/state/render/zoomState.js';

export function setZoomMax(v) {
  zoomState.zoomMax = v;
}
