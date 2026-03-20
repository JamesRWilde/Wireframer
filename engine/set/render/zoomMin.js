'use strict';
import { zoomState } from '@engine/state/render/zoomState.js';

export function setZoomMin(v) {
  zoomState.zoomMin = v;
}
