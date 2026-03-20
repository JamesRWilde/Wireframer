'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function applyFriction(factor = 0.85) {
  physicsState.wx *= factor;
  physicsState.wy *= factor;
  physicsState.wz *= factor;
}
