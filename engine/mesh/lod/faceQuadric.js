import { normalize } from './normalize.js';
import { cross } from './cross.js';
import { dot } from './dot.js';

export function faceQuadric(a, b, c) {
  const normal = normalize(cross(
    [b[0]-a[0], b[1]-a[1], b[2]-a[2]],
    [c[0]-a[0], c[1]-a[1], c[2]-a[2]]
  ));
  const d = -dot(normal, a);
  const [nx, ny, nz] = normal;
  return [nx*nx, nx*ny, nx*nz, nx*d, ny*ny, ny*nz, ny*d, nz*nz, nz*d, d*d];
}
