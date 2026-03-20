"use strict";
import { detailLevelState } from '@engine/state/render/detailLevelState.js';
export function setDetailLevelValue(v) {
  detailLevelState.value = v;
}
