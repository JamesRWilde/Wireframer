'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setHoldRotationFrames(value) {
  physicsState.HOLD_ROTATION_FRAMES = value;
}
