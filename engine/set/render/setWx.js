'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setWx(value) {
  physicsState.wx = value;
}
