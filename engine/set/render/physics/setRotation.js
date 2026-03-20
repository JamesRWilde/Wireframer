'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setRotation(value) {
  physicsState.R = value;
}
