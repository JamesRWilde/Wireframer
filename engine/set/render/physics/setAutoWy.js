'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setAutoWy(value) {
  physicsState.AUTO_WY = value;
}
