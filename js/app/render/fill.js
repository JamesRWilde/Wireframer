'use strict';

function triangulateFaceEarClipping(face, V) {
  if (!face || face.length < 3) return [];
  if (face.length === 3) return [[face[0], face[1], face[2]]];

  const verts = face.map((idx) => V[idx]);

  // Estimate face normal (Newell method) to choose a stable 2D projection plane.
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }

  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);

  // Drop the dominant axis to project to 2D with maximal area.
  const proj = verts.map((p) => {
    if (ax >= ay && ax >= az) return [p[1], p[2]]; // drop X
    if (ay >= ax && ay >= az) return [p[0], p[2]]; // drop Y
    return [p[0], p[1]]; // drop Z
  });

  function signedArea2(poly) {
    let area2 = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      area2 += a[0] * b[1] - b[0] * a[1];
    }
    return area2;
  }

  const area2 = signedArea2(proj);
  if (Math.abs(area2) < 1e-10) {
    // Degenerate polygon fallback.
    const out = [];
    for (let i = 1; i < face.length - 1; i++) out.push([face[0], face[i], face[i + 1]]);
    return out;
  }

  const ccw = area2 > 0;
  const order = Array.from({ length: face.length }, (_, i) => i);
  if (!ccw) order.reverse();

  function cross2(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  function pointInTri(p, a, b, c) {
    const c1 = cross2(a, b, p);
    const c2 = cross2(b, c, p);
    const c3 = cross2(c, a, p);
    const hasNeg = c1 < -1e-10 || c2 < -1e-10 || c3 < -1e-10;
    const hasPos = c1 > 1e-10 || c2 > 1e-10 || c3 > 1e-10;
    return !(hasNeg && hasPos);
  }

  const tris = [];
  let guard = face.length * face.length;

  while (order.length > 3 && guard-- > 0) {
    let earFound = false;

    for (let i = 0; i < order.length; i++) {
      const ia = order[(i - 1 + order.length) % order.length];
      const ib = order[i];
      const ic = order[(i + 1) % order.length];

      const a = proj[ia];
      const b = proj[ib];
      const c = proj[ic];
      if (cross2(a, b, c) <= 1e-10) continue; // reflex or nearly collinear

      let contains = false;
      for (let j = 0; j < order.length; j++) {
        const ip = order[j];
        if (ip === ia || ip === ib || ip === ic) continue;
        if (pointInTri(proj[ip], a, b, c)) {
          contains = true;
          break;
        }
      }
      if (contains) continue;

      tris.push([face[ia], face[ib], face[ic]]);
      order.splice(i, 1);
      earFound = true;
      break;
    }

    if (!earFound) {
      // Robust fallback for self-intersections or near-degenerate cases.
      for (let i = 1; i < order.length - 1; i++) {
        tris.push([face[order[0]], face[order[i]], face[order[i + 1]]]);
      }
      return tris;
    }
  }

  if (order.length === 3) {
    tris.push([face[order[0]], face[order[1]], face[order[2]]]);
  }

  return tris;
}

function getModelTriangles(model) {
  const faces = model.F || [];
  const tris = [];
  const V = model.V || [];

  for (const face of faces) {
    if (!face || face.length < 3) continue;
    if (face.length === 3) {
      tris.push([face[0], face[1], face[2]]);
    } else if (face.length === 4) {
      tris.push([face[0], face[1], face[2]]);
      tris.push([face[0], face[2], face[3]]);
    } else {
      tris.push(...triangulateFaceEarClipping(face, V));
    }
  }

  return tris;
}

function getModelShadingMode(model, triFaces) {
  const mode = (model && model._shadingMode) || 'auto';
  if (mode === 'flat' || mode === 'smooth') return mode;
  return triFaces.length > 80 ? 'smooth' : 'flat';
}

function getModelFaceNormals(model, triFaces) {
  if (model._faceNormals && model._faceNormals.length === triFaces.length) return model._faceNormals;

  const V = model.V;
  const faceNormals = new Array(triFaces.length);

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

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const a = V[tri[0]];
    const b = V[tri[1]];
    const c = V[tri[2]];

    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9) {
      faceNormals[i] = [0, 1, 0];
      continue;
    }

    // Keep normals consistently outward, regardless of source winding.
    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    nl = Math.hypot(nx, ny, nz);
    faceNormals[i] = [nx / nl, ny / nl, nz / nl];
  }

  model._faceNormals = faceNormals;
  return faceNormals;
}

function getModelTriCornerNormals(model, triFaces) {
  const shadingMode = getModelShadingMode(model, triFaces);
  const crease = Number.isFinite(model._creaseAngleDeg) ? model._creaseAngleDeg : 62;
  const key = `${shadingMode}|${Math.round(crease * 100)}`;
  if (model._triCornerNormals && model._triCornerNormalsKey === key && model._triCornerNormals.length === triFaces.length) {
    return model._triCornerNormals;
  }

  const faceNormals = getModelFaceNormals(model, triFaces);
  const cornerNormals = new Array(triFaces.length);

  if (shadingMode === 'flat') {
    for (let i = 0; i < triFaces.length; i++) {
      const n = faceNormals[i];
      cornerNormals[i] = [[n[0], n[1], n[2]], [n[0], n[1], n[2]], [n[0], n[1], n[2]]];
    }
    model._triCornerNormals = cornerNormals;
    model._triCornerNormalsKey = key;
    return cornerNormals;
  }

  const V = model.V;
  const vertexToFaces = Array.from({ length: V.length }, () => []);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    vertexToFaces[tri[0]].push(i);
    vertexToFaces[tri[1]].push(i);
    vertexToFaces[tri[2]].push(i);
  }

  const cosThreshold = shadingMode === 'smooth' ? -1 : Math.cos((crease * Math.PI) / 180);

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const nRef = faceNormals[i];
    const triCorner = new Array(3);

    for (let c = 0; c < 3; c++) {
      const vi = tri[c];
      let nx = 0;
      let ny = 0;
      let nz = 0;

      const adjacent = vertexToFaces[vi];
      for (let j = 0; j < adjacent.length; j++) {
        const fi = adjacent[j];
        const n = faceNormals[fi];
        const dot = nRef[0] * n[0] + nRef[1] * n[1] + nRef[2] * n[2];
        if (dot >= cosThreshold) {
          nx += n[0];
          ny += n[1];
          nz += n[2];
        }
      }

      let nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        triCorner[c] = [nRef[0], nRef[1], nRef[2]];
      } else {
        triCorner[c] = [nx / nl, ny / nl, nz / nl];
      }
    }

    cornerNormals[i] = triCorner;
  }

  model._triCornerNormals = cornerNormals;
  model._triCornerNormalsKey = key;
  return cornerNormals;
}

function getModelVertexNormals(model, triFaces) {
  if (model._vertexNormals) return model._vertexNormals;

  const V = model.V;
  let normals = model._normalsBuffer;
  if (!normals || normals.length !== V.length) {
    normals = Array.from({ length: V.length }, () => [0, 0, 0]);
    model._normalsBuffer = normals;
  } else {
    for (let i = 0; i < normals.length; i++) {
      normals[i][0] = 0;
      normals[i][1] = 0;
      normals[i][2] = 0;
    }
  }

  const cornerNormals = getModelTriCornerNormals(model, triFaces);
  const counts = new Uint16Array(V.length);

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const cn = cornerNormals[i];
    for (let c = 0; c < 3; c++) {
      const vi = tri[c];
      normals[vi][0] += cn[c][0];
      normals[vi][1] += cn[c][1];
      normals[vi][2] += cn[c][2];
      counts[vi]++;
    }
  }

  for (let i = 0; i < normals.length; i++) {
    let nx = normals[i][0];
    let ny = normals[i][1];
    let nz = normals[i][2];
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9 || counts[i] === 0) {
      normals[i] = [0, 1, 0];
      continue;
    }
    normals[i] = [nx / nl, ny / nl, nz / nl];
  }

  model._vertexNormals = normals;
  return normals;
}

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const T = frameData.T;
  const P2 = frameData.P2;

  if (!model._triFaces) model._triFaces = getModelTriangles(model);

  const triFaces = model._triFaces;
  if (!triFaces.length) return;

  // Draw fill to an offscreen layer at full triangle opacity, then composite once.
  // This prevents internal seam lines from accumulated per-triangle alpha blending.
  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading ? getModelTriCornerNormals(model, triFaces) : null;

  const seamExpandPx = useSmoothShading ? DENSE_SEAM_EXPAND_PX : 0;

  let triOrder = model._triOrder;
  if (!triOrder || triOrder.length !== triFaces.length) {
    triOrder = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) triOrder[i] = { tri: triFaces[i], triIndex: i, z: 0 };
    model._triOrder = triOrder;
  }

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const item = triOrder[i];
    item.tri = tri;
    item.triIndex = i;
    item.z = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
  }
  triOrder.sort((a, b) => b.z - a.z);

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
      const cn = triCornerNormals[item.triIndex];
      const na = cn[0];
      const nb = cn[1];
      const nc = cn[2];
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
