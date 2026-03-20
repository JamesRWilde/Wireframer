'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setDragging(value) {
  physicsState.dragging = value;
}
