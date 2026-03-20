'use strict';

export const renderState = {
  theme: null,
  themeMode: 'dark',
  fillOpacity: 1,
  wireOpacity: 1,
  themeVer: 0,
  cacheVer: -1,
  shadeDarkRgb: [0, 0, 0],
  shadeBrightRgb: [255, 255, 255],
  fillRgb: [0, 200, 120],
  edgeColor: '#ffffff',
  bgRgb: [0, 0, 0],
  bgColor: 'rgba(0,0,0,1)',
  particleColor: 'rgba(200,220,255,1)',
};

function relativeLuminanceRaw(rgb) {
  const r = linear(rgb[0]);
  const g = linear(rgb[1]);
  const b = linear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function linear(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

export function rebuildDerivedCache() {
  if (renderState.cacheVer === renderState.themeVer) return;
  renderState.cacheVer = renderState.themeVer;

  const t = renderState.theme;
  const dark = t?.shadeDark;
  renderState.shadeDarkRgb = Array.isArray(dark) ? dark : [0, 0, 0];

  const bright = t?.shadeBright;
  renderState.shadeBrightRgb = Array.isArray(bright) ? bright : [255, 255, 255];

  const fill = t?.fill;
  renderState.fillRgb = Array.isArray(fill) ? fill : [0, 200, 120];

  const lum = relativeLuminanceRaw(renderState.fillRgb);
  renderState.edgeColor = lum > 0.5 ? '#000000' : '#ffffff';

  const bg = t?.bg;
  renderState.bgRgb = Array.isArray(bg) ? bg : [0, 0, 0];
  renderState.bgColor = `rgba(${renderState.bgRgb[0]}, ${renderState.bgRgb[1]}, ${renderState.bgRgb[2]}, 1)`;

  const particle = t?.particle;
  renderState.particleColor = Array.isArray(particle)
    ? `rgba(${particle[0]}, ${particle[1]}, ${particle[2]}, 1)`
    : 'rgba(200,220,255,1)';
}
