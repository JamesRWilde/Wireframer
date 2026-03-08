'use strict';

function getModelTriangles(model) {
  const faces = model.F || [];
  const tris = [];

  for (const face of faces) {
    if (!face || face.length < 3) continue;
    if (face.length === 3) {
      tris.push([face[0], face[1], face[2]]);
    } else if (face.length === 4) {
      tris.push([face[0], face[1], face[2]]);
      tris.push([face[0], face[2], face[3]]);
    } else {
      for (let i = 1; i < face.length - 1; i++) {
        tris.push([face[0], face[i], face[i + 1]]);
      }
    }
  }

  return tris;
}

function getModelVertexNormals(model, triFaces) {
  if (model._vertexNormals) return model._vertexNormals;

  const V = model.V;
  const normals = Array.from({ length: V.length }, () => [0, 0, 0]);

  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of V) {
    cx += v[0];
    cy += v[1];
    cz += v[2];
  }
  const invCount = V.length ? 1 / V.length : 1;
  cx *= invCount;
  cy *= invCount;
  cz *= invCount;

  for (const tri of triFaces) {
    const ia = tri[0], ib = tri[1], ic = tri[2];
    const a = V[ia], b = V[ib], c = V[ic];

    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9) continue;

    // Orient normals outward from object center to avoid winding inconsistencies.
    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    normals[ia][0] += nx; normals[ia][1] += ny; normals[ia][2] += nz;
    normals[ib][0] += nx; normals[ib][1] += ny; normals[ib][2] += nz;
    normals[ic][0] += nx; normals[ic][1] += ny; normals[ic][2] += nz;
  }

  for (let i = 0; i < normals.length; i++) {
    let nx = normals[i][0];
    let ny = normals[i][1];
    let nz = normals[i][2];
    let nl = Math.hypot(nx, ny, nz);

    if (nl < 1e-9) {
      nx = V[i][0] - cx;
      ny = V[i][1] - cy;
      nz = V[i][2] - cz;
      nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        normals[i] = [0, 1, 0];
        continue;
      }
    }

    normals[i] = [nx / nl, ny / nl, nz / nl];
  }

  model._vertexNormals = normals;
  return normals;
}

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  const T = model.V.map(v => mvec(R, v));
  const P2 = T.map(p => project(p));

  if (!model._triFaces) model._triFaces = getModelTriangles(model);

  const triFaces = model._triFaces;
  if (!triFaces.length) return;

  // Draw fill to an offscreen layer at full triangle opacity, then composite once.
  // This prevents internal seam lines from accumulated per-triangle alpha blending.
  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  // Dense meshes (revolved/tubed forms) look better with topology-based smooth normals.
  const useSmoothShading = triFaces.length > 80;
  const vertexNormals = useSmoothShading ? getModelVertexNormals(model, triFaces) : null;

  const seamExpandPx = useSmoothShading ? DENSE_SEAM_EXPAND_PX : 0;

  const triOrder = triFaces
    .map((tri) => ({
      tri,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    }))
    .sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    const v0 = T[a], v1 = T[b], v2 = T[c];
    const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
    const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];

    let nx;
    let ny;
    let nz;

    if (useSmoothShading) {
      const na = vertexNormals[a];
      const nb = vertexNormals[b];
      const nc = vertexNormals[c];
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-6) continue;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    } else {
      nx = uy * vz - uz * vy;
      ny = uz * vx - ux * vz;
      nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-6) continue;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    }

    const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
    const ndotl = Math.max(0, useSmoothShading ? ndotlRaw : Math.abs(ndotlRaw));

    // Blinn-Phong style highlight with fixed camera direction.
    const hx = LIGHT_DIR[0] + VIEW_DIR[0];
    const hy = LIGHT_DIR[1] + VIEW_DIR[1];
    const hz = LIGHT_DIR[2] + VIEW_DIR[2];
    const hl = Math.hypot(hx, hy, hz);
    const hnx = hx / hl, hny = hy / hl, hnz = hz / hl;
    const nhRaw = nx * hnx + ny * hny + nz * hnz;
    const nh = Math.max(0, useSmoothShading ? nhRaw : Math.abs(nhRaw));
    const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

    const ambient = 0.26;
    const diffuse = 0.72 * ndotl;
    const specular = useSmoothShading ? 0.18 * spec : 0.30 * spec;
    const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));

    const shadeColor = lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
    let axd = ax;
    let ayd = ay;
    let bxd = bx;
    let byd = by;
    let cxd = cx;
    let cyd = cy;

    if (seamExpandPx > 0) {
      const mx = (ax + bx + cx) / 3;
      const my = (ay + by + cy) / 3;

      let dax = ax - mx;
      let day = ay - my;
      let dal = Math.hypot(dax, day);
      if (dal > 1e-6) {
        dax /= dal;
        day /= dal;
        axd = ax + dax * seamExpandPx;
        ayd = ay + day * seamExpandPx;
      }

      let dbx = bx - mx;
      let dby = by - my;
      let dbl = Math.hypot(dbx, dby);
      if (dbl > 1e-6) {
        dbx /= dbl;
        dby /= dbl;
        bxd = bx + dbx * seamExpandPx;
        byd = by + dby * seamExpandPx;
      }

      let dcx = cx - mx;
      let dcy = cy - my;
      let dcl = Math.hypot(dcx, dcy);
      if (dcl > 1e-6) {
        dcx /= dcl;
        dcy /= dcl;
        cxd = cx + dcx * seamExpandPx;
        cyd = cy + dcy * seamExpandPx;
      }
    }

    fillLayerCtx.beginPath();
    fillLayerCtx.moveTo(axd, ayd);
    fillLayerCtx.lineTo(bxd, byd);
    fillLayerCtx.lineTo(cxd, cyd);
    fillLayerCtx.closePath();
    fillLayerCtx.fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
    fillLayerCtx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = opacity;
  ctx.drawImage(fillLayerCanvas, 0, 0);
  ctx.restore();
}
