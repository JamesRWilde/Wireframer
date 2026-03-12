import { contrastRatio } from '../color-utils/contrastRatio.js';
import { mixRgb } from '../color-utils/mixRgb.js';

export function enforceContrast(fg, bg, minRatio) {
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
