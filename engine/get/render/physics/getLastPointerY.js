'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function getLastPointerY() {
  return physicsState.lastPointerY;
}
