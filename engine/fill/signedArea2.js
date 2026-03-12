'use strict';

export function signedArea2(poly) {
  let area2 = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    area2 += a[0] * b[1] - b[0] * a[1];
  }
  return area2;
}
