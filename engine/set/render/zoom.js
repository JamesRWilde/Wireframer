'use strict';
import { zoomState } from '@engine/state/render/zoomState.js';

export function setZoom(v) {
  zoomState.zoom = v;
}
