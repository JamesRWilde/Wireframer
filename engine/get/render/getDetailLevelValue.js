"use strict";
import { detailLevelState } from '@engine/state/render/detailLevelState.js';
export function getDetailLevelValue() {
  return detailLevelState.value;
}
