'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function easeTowardAuto() {
  physicsState.wx += (physicsState.AUTO_WX - physicsState.wx) * 0.04;
  physicsState.wy += (physicsState.AUTO_WY - physicsState.wy) * 0.04;
  physicsState.wz += (physicsState.AUTO_WZ - physicsState.wz) * 0.04;
}
