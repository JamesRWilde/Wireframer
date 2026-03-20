'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setAutoWz(value) {
  physicsState.AUTO_WZ = value;
}
