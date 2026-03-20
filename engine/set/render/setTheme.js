'use strict';
import { renderState } from '@engine/state/render/renderState.js';

export function setTheme(t) {
  renderState.theme = t;
  renderState.themeVer++;
  renderState.cacheVer = -1;
}
