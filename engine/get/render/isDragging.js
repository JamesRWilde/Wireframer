'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function isDragging() {
  return physicsState.dragging;
}
