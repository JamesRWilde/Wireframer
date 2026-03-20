'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function getRotation() {
  return physicsState.R;
}
