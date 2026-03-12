'use strict';

export function isConvex(proj, i0, i1, i2, area2) {
  const a = proj[i0], b = proj[i1], c = proj[i2];
  return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) * area2 > 0;
}
