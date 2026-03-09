'use strict';

function enforceContrast(fg, bg, minRatio) {
  const current = contrastRatio(fg, bg);
  if (current >= minRatio) return fg;

  let best = fg;
  let bestRatio = current;

  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const towardWhite = mixRgb(fg, [255, 255, 255], t);
    const cw = contrastRatio(towardWhite, bg);
    if (cw > bestRatio) {
      bestRatio = cw;
      best = towardWhite;
    }
    if (cw >= minRatio) return towardWhite;

    const towardBlack = mixRgb(fg, [0, 0, 0], t);
    const cb = contrastRatio(towardBlack, bg);
    if (cb > bestRatio) {
      bestRatio = cb;
      best = towardBlack;
    }
    if (cb >= minRatio) return towardBlack;
  }

  return best;
}

function buildCustomTheme(rgbInput) {
  const base = [clampByte(rgbInput[0]), clampByte(rgbInput[1]), clampByte(rgbInput[2])];
  const isLight = THEME_MODE === 'light';

  // In dark mode, use original bg-solid color for background (no haze)
  const bg = isLight
    ? mixRgb(base, [255, 255, 255], 0.95)
    : [0, 0, 0]; // match --bg-solid pure black
  const uiBg = isLight ? mixRgb(base, [255, 255, 255], 0.88) : mixRgb(base, [0, 0, 0], 0.9);
  const panelBg = isLight ? mixRgb(base, [255, 255, 255], 0.78) : mixRgb(base, [0, 0, 0], 0.88);
  const optionBg = isLight ? mixRgb(base, [255, 255, 255], 0.82) : mixRgb(base, [0, 0, 0], 0.88);

  const title = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.72), bg, 5.5)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.54), bg, 5.5);
  const subtitle = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.46), bg, 2.3)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.16), bg, 2.3);
  const controlFg = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.6), bg, 4.2)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.32), bg, 4.2);
  const controlHoverFg = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.8), bg, 5.5)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.58), bg, 5.5);
  const label = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.54), bg, 3.6)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.26), bg, 3.6);
  const value = isLight
    ? enforceContrast(mixRgb(base, [0, 0, 0], 0.72), bg, 4.8)
    : enforceContrast(mixRgb(base, [255, 255, 255], 0.46), bg, 4.8);

  return {
    bg,
    particle: isLight ? mixRgb(base, [0, 0, 0], 0.9) : mixRgb(base, [255, 255, 255], 0.34),
    wireA: isLight ? mixRgb(base, [255, 255, 255], 0.12) : mixRgb(base, [0, 0, 0], 0.2),
    wireB: isLight ? mixRgb(base, [0, 0, 0], 0.18) : mixRgb(base, [255, 255, 255], 0.08),
    wireNear: isLight ? mixRgb(base, [255, 255, 255], 0.28) : mixRgb(base, [0, 0, 0], 0.42),
    wireFar: isLight ? mixRgb(base, [0, 0, 0], 0.46) : mixRgb(base, [255, 255, 255], 0.46),
    shadeDark: isLight ? mixRgb(base, [255, 255, 255], 0.22) : mixRgb(base, [0, 0, 0], 0.5),
    shadeBright: isLight ? mixRgb(base, [0, 0, 0], 0.24) : mixRgb(base, [255, 255, 255], 0.3),
    morph: isLight ? mixRgb(base, [0, 0, 0], 0.28) : mixRgb(base, [255, 255, 255], 0.36),
    uiVars: {
      '--bg-solid': toRgbCss(bg),
      '--ui-title': toRgbaCss(title, 0.88),
      '--ui-subtitle': toRgbaCss(subtitle, 0.5),
      '--ui-control-border': toRgbaCss(isLight ? mixRgb(base, [0, 0, 0], 0.2) : mixRgb(base, [255, 255, 255], 0.12), 0.42),
      '--ui-control-fg': toRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': toRgbaCss(isLight ? mixRgb(base, [0, 0, 0], 0.36) : mixRgb(base, [255, 255, 255], 0.28), 0.7),
      '--ui-control-hover-fg': toRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': toRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': toRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': toRgbCss(optionBg),
      '--ui-label': toRgbaCss(label, 0.82),
      '--ui-value': toRgbaCss(value, 0.9),
      '--ui-switch-glow': toRgbaCss(isLight ? mixRgb(base, [0, 0, 0], 0.24) : mixRgb(base, [255, 255, 255], 0.46), 0.58),
      '--ui-stats': toRgbaCss(isLight ? mixRgb(base, [0, 0, 0], 0.34) : mixRgb(base, [255, 255, 255], 0.18), 0.42),
      '--ui-object-label': toRgbaCss(value, 0.64),
      '--ui-hint': toRgbaCss(label, 0.36),
      '--ui-accent': toRgbCss(base),
    },
  };
}

function setThemeMode(mode, options = {}) {
  const { apply = true } = options;
  THEME_MODE = mode === 'light' ? 'light' : 'dark';
  if (themeMode) themeMode.value = THEME_MODE;
  if (apply) applyPalette();
}

function randomPresetRgb() {
  for (let i = 0; i < 18; i++) {
    const hue = Math.random();
    const saturation = 0.68 + Math.random() * 0.28;
    const value = 0.74 + Math.random() * 0.23;
    const rgb = hsvToRgb(hue, saturation, value);

    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    const spread = max - min;
    const lum = relativeLuminance(rgb);

    if (spread >= 90 && max >= 150 && lum >= 0.17) return rgb;
  }

  return hsvToRgb(Math.random(), 0.82, 0.86);
}

function readCustomRgb() {
  try {
    const saved = localStorage.getItem(CUSTOM_RGB_KEY);
    if (!saved) return CUSTOM_RGB_DEFAULT.slice();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== 3) return CUSTOM_RGB_DEFAULT.slice();
    return [clampByte(parsed[0]), clampByte(parsed[1]), clampByte(parsed[2])];
  } catch {
    return CUSTOM_RGB_DEFAULT.slice();
  }
}

function persistCustomRgb() {
  try {
    localStorage.setItem(CUSTOM_RGB_KEY, JSON.stringify(CUSTOM_RGB));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}

function updateCustomColorUi() {
  if (!customRed || !customGreen || !customBlue) return;

  const [r, g, b] = CUSTOM_RGB;
  customRed.value = String(r);
  customGreen.value = String(g);
  customBlue.value = String(b);

  if (customRedValue) customRedValue.textContent = String(r);
  if (customGreenValue) customGreenValue.textContent = String(g);
  if (customBlueValue) customBlueValue.textContent = String(b);
  if (customHex) customHex.textContent = toHex(CUSTOM_RGB);
  if (customSwatch) customSwatch.style.background = toRgbCss(CUSTOM_RGB);

  for (const entry of PRESET_SWATCH_BUTTONS) {
    entry.button.classList.toggle('is-active', rgbEquals(entry.rgb, CUSTOM_RGB));
  }
}

function getCustomRgbFromInputs() {
  return [
    clampByte(customRed ? customRed.value : CUSTOM_RGB[0]),
    clampByte(customGreen ? customGreen.value : CUSTOM_RGB[1]),
    clampByte(customBlue ? customBlue.value : CUSTOM_RGB[2]),
  ];
}

function setCustomRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  CUSTOM_RGB = [clampByte(rgb[0]), clampByte(rgb[1]), clampByte(rgb[2])];
  updateCustomColorUi();
  if (persist) persistCustomRgb();
  if (apply) applyPalette();
}

function initPresetSwatches() {
  if (!presetSwatches) return;

  presetSwatches.innerHTML = '';
  PRESET_SWATCH_BUTTONS.length = 0;

  for (const preset of PRESET_SWATCHES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-swatch';
    button.title = `${preset.name} (${toHex(preset.rgb)})`;
    button.setAttribute('aria-label', `${preset.name} preset ${toHex(preset.rgb)}`);
    button.style.setProperty('--swatch-color', toRgbCss(preset.rgb));
    button.addEventListener('click', () => {
      setCustomRgb(preset.rgb, { persist: true, apply: true });
    });

    presetSwatches.appendChild(button);
    PRESET_SWATCH_BUTTONS.push({ button, rgb: preset.rgb });
  }

  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'preset-swatch is-shuffle';
  shuffleButton.title = `${SHUFFLE_SWATCH_NAME} random preset`;
  shuffleButton.setAttribute('aria-label', `${SHUFFLE_SWATCH_NAME} random preset`);
  shuffleButton.addEventListener('click', () => {
    setCustomRgb(randomPresetRgb(), { persist: true, apply: true });
  });
  presetSwatches.appendChild(shuffleButton);
}

function applyPalette() {
  const palette = buildCustomTheme(CUSTOM_RGB);
  THEME = palette;
  for (const [k, v] of Object.entries(palette.uiVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}
