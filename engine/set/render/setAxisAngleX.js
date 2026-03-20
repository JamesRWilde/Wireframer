'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setAxisAngleX(value) {
  physicsState.axisAngleX = value;
}
