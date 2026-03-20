'use strict';
import { renderState } from '@engine/state/render/renderState.js';

export function setFillOpacity(v) {
  renderState.fillOpacity = v;
}
