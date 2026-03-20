'use strict';
import { renderState } from '@engine/state/render/renderState.js';

export function setWireOpacity(v) {
  renderState.wireOpacity = v;
}
