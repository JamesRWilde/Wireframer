import { mmul } from './mmul.js';
import { mry } from './mry.js';
import { mrx } from './mrx.js';
import { R } from './R.js';

export function initializeRotation() {
  if (typeof mry === 'function' && typeof mrx === 'function' && typeof mmul === 'function') {
    R.value = mmul(mry(0.4), mrx(0.18));
  } else {
    R.value = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
}
