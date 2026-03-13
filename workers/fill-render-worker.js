/**
 * fill-render-worker.js - Fill Rendering Web Worker
 * 
 * PURPOSE:
 *   Performs triangle sorting, lighting calculations, and rasterization
 *   in a separate thread using OffscreenCanvas. Frees the main thread
 *   from expensive per-triangle operations.
 * 
 * ARCHITECTURE ROLE:
 *   Receives transformed vertex data and triangle faces, computes lighting,
 *   sorts triangles back-to-front, and rasterizes them to an OffscreenCanvas.
 *   Returns the rendered ImageBitmap for compositing on the main thread.
 * 
 * MESSAGE PROTOCOL:
 *   Main → Worker:
 *     { type: 'init', canvas: OffscreenCanvas } - Initialize with canvas
 *     { type: 'render', T, P2, triFaces, triCornerNormals, shadingMode,
 *       theme, fillAlpha, seamExpandPx, frameId } - Render frame
 * 
 *   Worker → Main:
 *     { type: 'ready' } - Worker initialized
 *     { type: 'rendered', imageBitmap: ImageBitmap, frameId } - Rendered frame
 */

"use strict";

// OffscreenCanvas context (set during init)
let offCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;

/**
 * lerpColor - Linearly interpolates between two colors
 * 
 * @param {string|Array} color1 - Start color (hex string or [r,g,b] array)
 * @param {string|Array} color2 - End color (hex string or [r,g,b] array)
 * @param {number} t - Interpolation factor (0-1)
 * 
 * @returns {Array<number>} RGB color array [r, g, b] with values 0-255
 */
function lerpColor(color1, color2, t) {
  // Handle both hex strings and [r,g,b] arrays
  let r1, g1, b1, r2, g2, b2;
  
  if (Array.isArray(color1)) {
    r1 = color1[0]; g1 = color1[1]; b1 = color1[2];
  } else {
    r1 = Number.parseInt(color1.slice(1, 3), 16);
    g1 = Number.parseInt(color1.slice(3, 5), 16);
    b1 = Number.parseInt(color1.slice(5, 7), 16);
  }
  
  if (Array.isArray(color2)) {
    r2 = color2[0]; g2 = color2[1]; b2 = color2[2];
  } else {
    r2 = Number.parseInt(color2.slice(1, 3), 16);
    g2 = Number.parseInt(color2.slice(3, 5), 16);
    b2 = Number.parseInt(color2.slice(5, 7), 16);
  }

  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t)
  ];
}

/**
 * computeTriangleShadeColor - Computes shaded color using Blinn-Phong lighting
 * 
 * @param {Array<number>} normal - Surface normal [nx, ny, nz]
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @param {Object} theme - Theme colors { shadeDark, shadeBright }
 * 
 * @returns {Array<number>} RGB color [r, g, b]
 */
function computeTriangleShadeColor(normal, useSmoothShading, theme) {
  const LIGHT_DIR = [-0.532, 0.847, 0];
  const VIEW_DIR = [0, 0, -1];

  const nx = normal[0], ny = normal[1], nz = normal[2];

  // Diffuse
  const ndotl = Math.max(0, nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2]);

  // Specular (Blinn-Phong)
  const hx = LIGHT_DIR[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl, hny = hy / hl, hnz = hz / hl;
  const nh = Math.max(0, nx * hnx + ny * hny + nz * hnz);
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  // Combine
  const ambient = 0.26;
  const diffuse = 0.72 * ndotl;
  const specular = useSmoothShading ? 0.18 * spec : 0.3 * spec;
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));

  return lerpColor(theme.shadeDark || [0, 0, 0], theme.shadeBright || [255, 255, 255], lit);
}

/**
 * resolveTriangleNormal - Resolves surface normal for a triangle
 * 
 * @param {Array<number>} tri - Triangle vertex indices [a, b, c]
 * @param {number} triIndex - Triangle index for corner normals lookup
 * @param {Array} T - Transformed vertex positions
 * @param {Array} triCornerNormals - Per-corner normals (for smooth shading)
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @param {Array<number>} R - Rotation matrix (for rotating normals)
 * 
 * @returns {Array<number>|null} Normalized normal or null if degenerate
 */
function resolveTriangleNormal(tri, triIndex, T, triCornerNormals, useSmoothShading, R) {
  const [a, b, c] = tri;
  const v0 = T[a], v1 = T[b], v2 = T[c];

  let nx, ny, nz;

  if (useSmoothShading && triCornerNormals?.[triIndex]) {
    const cn = triCornerNormals[triIndex];
    if (R) {
      const rotate = v => [
        R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
        R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
        R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
      ];
      const na = rotate(cn[0]);
      const nb = rotate(cn[1]);
      const nc = rotate(cn[2]);
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
    } else {
      nx = cn[0][0] + cn[1][0] + cn[2][0];
      ny = cn[0][1] + cn[1][1] + cn[2][1];
      nz = cn[0][2] + cn[1][2] + cn[2][2];
    }
  } else {
    // Flat shading
    const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
    const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
    nx = uy * vz - uz * vy;
    ny = uz * vx - ux * vz;
    nz = ux * vy - uy * vx;
  }

  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-6) return null;
  return [nx / nl, ny / nl, nz / nl];
}

/**
 * expandTriangleForSeam - Expands triangle vertices to prevent seams
 * 
 * @param {Array<Array<number>>} tri2d - Triangle 2D vertices
 * @param {number} expandPx - Expansion amount in pixels
 * 
 * @returns {Array<Array<number>>} Expanded triangle vertices
 */
function expandTriangleForSeam(tri2d, expandPx) {
  if (expandPx <= 0) return tri2d;

  const [a, b, c] = tri2d;
  const cx = (a[0] + b[0] + c[0]) / 3;
  const cy = (a[1] + b[1] + c[1]) / 3;

  return [
    [a[0] + (a[0] - cx) * expandPx * 0.01, a[1] + (a[1] - cy) * expandPx * 0.01],
    [b[0] + (b[0] - cx) * expandPx * 0.01, b[1] + (b[1] - cy) * expandPx * 0.01],
    [c[0] + (c[0] - cx) * expandPx * 0.01, c[1] + (c[1] - cy) * expandPx * 0.01]
  ];
}

/**
 * fillTriangle - Fills a triangle on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<Array<number>>} tri2d - Triangle vertices
 * @param {Array<number>} color - RGB color
 * @param {number} alpha - Alpha value
 */
function fillTriangle(ctx, tri2d, color, alpha) {
  ctx.beginPath();
  ctx.moveTo(tri2d[0][0], tri2d[0][1]);
  ctx.lineTo(tri2d[1][0], tri2d[1][1]);
  ctx.lineTo(tri2d[2][0], tri2d[2][1]);
  ctx.closePath();
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  ctx.fill();
}

/**
 * renderFillTriangles - Renders all fill triangles
 * 
 * @param {Object} params - Render parameters
 */
function renderFillTriangles({ T, P2, triFaces, triCornerNormals, useSmoothShading, theme, fillAlpha, seamExpandPx, R }) {
  // Sort triangles back-to-front (painter's algorithm)
  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = {
      tri,
      triIndex: i,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    };
  }
  triOrder.sort((a, b) => b.z - a.z);

  // Render each triangle
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    // Backface culling
    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    // Resolve normal
    const normal = resolveTriangleNormal(item.tri, item.triIndex, T, triCornerNormals, useSmoothShading, R);
    if (!normal) continue;

    // Compute shade color
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading, theme);

    // Expand for seams
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);

    // Fill triangle
    fillTriangle(offCtx, tri2d, shadeColor, fillAlpha);
  }

}

// Worker message handler
onmessage = async (event) => {
  const { type } = event.data;

  try {
    switch (type) {
      case 'init': {
        const { canvas, width, height } = event.data;
        canvasWidth = width;
        canvasHeight = height;
        offCtx = canvas.getContext('2d');
        postMessage({ type: 'ready' });
        break;
      }

      case 'resize': {
        const { width, height } = event.data;
        canvasWidth = width;
        canvasHeight = height;
        break;
      }

      case 'render': {
        if (!offCtx) {
          postMessage({ type: 'error', message: 'Worker not initialized' });
          return;
        }

        const { T, P2, triFaces, triCornerNormals, useSmoothShading, theme, fillAlpha, seamExpandPx, R, frameId } = event.data;
        


        // Clear canvas
        offCtx.setTransform(1, 0, 0, 1, 0, 0);
        offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        offCtx.globalCompositeOperation = 'source-over';

        // Render triangles
        renderFillTriangles({
          T, P2, triFaces, triCornerNormals, useSmoothShading,
          theme, fillAlpha, seamExpandPx, R
        });

        // Transfer as ImageBitmap
        const imageBitmap = await createImageBitmap(offCtx.canvas);
        postMessage({ type: 'rendered', imageBitmap, frameId }, [imageBitmap]);
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message });
  }
};
