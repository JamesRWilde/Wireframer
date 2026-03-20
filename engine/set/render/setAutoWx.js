'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setAutoWx(value) {
  physicsState.AUTO_WX = value;
}
