'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setLastPointerX(value) {
  physicsState.lastPointerX = value;
}
