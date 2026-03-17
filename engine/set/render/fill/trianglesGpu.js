/**
 * renderFillTriangles.js - Fill Triangle Renderer
 *
 * PURPOSE:
 *   Renders a frame's filled triangles by sorting them back-to-front (painter's algorithm),
 *   resolving normals for lighting, and rasterizing each triangle to the provided canvas context.
 *
 * ARCHITECTURE ROLE:
 *   Runs inside the fill-render worker to perform the per-frame fill rasterization work.
 *   It is intentionally synchronous and optimized for per-triangle performance.
 *
 * DATA FORMAT:
 *   - T: Array of transformed 3D vertex positions (e.g. [[x,y,z], ...])
 *   - P2: Array of projected 2D vertex coords (e.g. [[x,y], ...])
 *   - triFaces: Array of triangle index triplets [[a,b,c], ...]
 *   - triCornerNormals: Array of per-triangle per-corner normals for smooth shading
 *   - theme: Object with theme colors used for shading
 *
 * @param {Object} params - Render parameters
 * @param {Array<[number,number,number]>} params.T - Transformed vertex positions
 * @param {Array<[number,number]>} params.P2 - Projected 2D vertex positions
 * @param {Array<[number,number,number]>} params.triFaces - Triangle face indices
 * @param {Array<([number,number,number])[]>} params.triCornerNormals - Per-corner normals
 * @param {boolean} params.useSmoothShading - Whether smooth shading is enabled
 * @param {Object} params.theme - Theme colors used for lighting
 * @param {number} params.fillAlpha - Fill alpha (opacity)
 * @param {number} params.seamExpandPx - Seam expansion in pixels to prevent gaps
 * @param {number[]|null} params.R - Optional rotation matrix for normals
 * @param {CanvasRenderingContext2D} params.ctx - 2D canvas context to render into
 */

"use strict";
import {triangleNormalGpu}from '@engine/get/render/resolve/triangleNormalGpu.js';
import {triangleGpu}from '@engine/get/render/compute/triangleGpu.js';
import {seamGpu}from '@engine/get/render/expand/seamGpu.js';
import {triangle}from '@engine/set/cpu/fill/triangle.js';

export function trianglesGpu({ T, P2, triFaces, triCornerNormals, useSmoothShading, theme, fillAlpha, seamExpandPx, R, ctx }) {
  // Sort triangles back-to-front (painter's algorithm). Sorting by average depth helps
  // ensure proper overlap when drawing triangles directly to a 2D canvas.
  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = {
      tri,
      triIndex: i,
      // Average Z value of triangle vertices in view space.
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    };
  }
  triOrder.sort((a, b) => b.z - a.z);

  // Render each triangle in sorted order
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    // Skip degenerate triangles (near-zero area)
    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    // Resolve triangle normal for lighting.
    const normal = resolveTriangleNormal(item.tri, item.triIndex, T, triCornerNormals, useSmoothShading, R);
    if (!normal) continue;

    // Determine shaded fill color.
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading, theme);

    // Expand triangle slightly to avoid visible seams between adjacent triangles.
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);

    // Rasterize the triangle into the 2D canvas context.
    triangle(ctx, tri2d, shadeColor, fillAlpha);
  }
}
