'use strict';
import { renderState } from '@engine/state/render/renderState.js';

export function setThemeMode(mode) {
  renderState.themeMode = mode === 'light' ? 'light' : 'dark';
}
