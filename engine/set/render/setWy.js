'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setWy(value) {
  physicsState.wy = value;
}
