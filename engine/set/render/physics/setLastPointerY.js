'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setLastPointerY(value) {
  physicsState.lastPointerY = value;
}
