'use strict';
import { zoomState } from '@engine/state/render/zoomState.js';

export function getZoom() {
  return zoomState.zoom;
}
