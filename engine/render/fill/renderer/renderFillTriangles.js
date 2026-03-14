import { computeTriangleShadeColor } from '../lighting/computeTriangleShadeColor.js';
import { resolveTriangleNormal } from '../lighting/resolveTriangleNormal.js';
import { expandTriangleForSeam } from '../raster/expandTriangleForSeam.js';
import { fillTriangleOnLayer } from '../raster/fillTriangleOnLayer.js';

export function renderFillTriangles({
  triOrder,
  P2,
  T,
  triCornerNormals,
  useSmoothShading,
  seamExpandPx,
  fillLayerCtx,
  fillAlpha,
}) {
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue; // Skip degenerate triangles

    const normal = resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);

    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor, fillAlpha);
  }
}
