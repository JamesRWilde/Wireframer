'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function decrementHoldRotationFrames() {
  physicsState.HOLD_ROTATION_FRAMES -= 1;
}
