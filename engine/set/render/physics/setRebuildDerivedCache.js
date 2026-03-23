'use strict';

/**
 * setRebuildDerivedCache.js - Recompute Derived Render State Cache
 *
 * PURPOSE:
 *   Recalculates derived render values (shades, fill colors, edge colors)
 *   when theme state changes.
 *
 * ARCHITECTURE ROLE:
 *   Called by get render getters when theme version changes to keep cached
 *   dependent values in sync.
 *
 * WHY THIS EXISTS:
 *   Avoids recomputing derived color data on every render call by tracking
 *   theme versions and rebuilding only when needed.
 */
import { renderState } from '@engine/state/render/stateRenderState.js';
import { utilRelativeLuminanceRaw } from '@engine/util/render/utilRelativeLuminanceRaw.js';

/**
 * setRebuildDerivedCache - Recalculate derived render state properties from theme.
 */
export function setRebuildDerivedCache() {
  if (renderState.cacheVer === renderState.themeVer) return;
  renderState.cacheVer = renderState.themeVer;

  const t = renderState.theme;
  const dark = t?.shadeDark;
  renderState.shadeDarkRgb = Array.isArray(dark) ? dark : [0, 0, 0];

  const bright = t?.shadeBright;
  renderState.shadeBrightRgb = Array.isArray(bright) ? bright : [255, 255, 255];

  const fill = t?.fill;
  renderState.fillRgb = Array.isArray(fill) ? fill : [0, 200, 120];

  const lum = utilRelativeLuminanceRaw(renderState.fillRgb);
  renderState.edgeColor = lum > 0.5 ? '#000000' : '#ffffff';

  const bg = t?.bg;
  renderState.bgRgb = Array.isArray(bg) ? bg : [0, 0, 0];
  renderState.bgColor = `rgba(${renderState.bgRgb[0]}, ${renderState.bgRgb[1]}, ${renderState.bgRgb[2]}, 1)`;

  const particle = t?.particle;
  renderState.particleColor = Array.isArray(particle)
    ? `rgba(${particle[0]}, ${particle[1]}, ${particle[2]}, 1)`
    : 'rgba(200,220,255,1)';
}
