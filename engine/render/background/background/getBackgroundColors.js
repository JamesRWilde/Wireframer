// Returns the background fill color and the base particle color strings.
// Uses theme values when available, or falls back to safe defaults.
export function getBackgroundColors() {
  const bgRgb = globalThis.THEME?.bg ?? [0, 0, 0];
  const bgColor = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},1)`;

  const themeParticle = globalThis.THEME?.particle;
  if (themeParticle) {
    return { bgColor, particleColor: `rgba(${themeParticle[0]},${themeParticle[1]},${themeParticle[2]},1)` };
  }

  const custom = globalThis.CUSTOM_RGB;
  if (custom?.length === 3) {
    return { bgColor, particleColor: `rgba(${custom[0]},${custom[1]},${custom[2]},1)` };
  }

  return { bgColor, particleColor: 'rgba(200,220,255,1)' };
}
