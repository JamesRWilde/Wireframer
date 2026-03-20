'use strict';
import { renderState } from '@engine/state/render/renderState.js';

export function getThemeMode() {
  return renderState.themeMode;
}
