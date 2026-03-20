'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setAxisAngleY(value) {
  physicsState.axisAngleY = value;
}
