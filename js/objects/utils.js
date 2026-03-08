'use strict';

(function initGeometryUtilities(global) {
  function buildRevolution(profile, segs) {
    const V = [];
    const E = [];
    const F = [];

    for (let i = 0; i < profile.length; i++) {
      const [r, y] = profile[i];
      for (let j = 0; j < segs; j++) {
        const a = (j / segs) * Math.PI * 2;
        V.push([r * Math.cos(a), y, r * Math.sin(a)]);
      }
    }

    for (let i = 0; i < profile.length; i++) {
      const r = profile[i][0];
      for (let j = 0; j < segs; j++) {
        const cur = i * segs + j;
        if (r > 0.01) E.push([cur, i * segs + (j + 1) % segs]);
        if (i < profile.length - 1) E.push([cur, (i + 1) * segs + j]);

        if (i < profile.length - 1) {
          const r2 = profile[i + 1][0];
          if (r > 0.01 && r2 > 0.01) {
            const a = i * segs + j;
            const b = i * segs + (j + 1) % segs;
            const c = (i + 1) * segs + (j + 1) % segs;
            const d = (i + 1) * segs + j;
            F.push([a, b, c, d]);
          }
        }
      }
    }

    return { V, E, F };
  }

  function buildTube(curveFn, segs, sides, tubeR) {
    const V = [];
    const E = [];
    const F = [];
    const TAU = Math.PI * 2;
    const EPS = (TAU / segs) * 0.01;

    for (let i = 0; i < segs; i++) {
      const t = (i / segs) * TAU;
      const [cx, cy, cz] = curveFn(t);

      const [x1, y1, z1] = curveFn(t + EPS);
      let tx = x1 - cx;
      let ty = y1 - cy;
      let tz = z1 - cz;
      const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      tx /= tl;
      ty /= tl;
      tz /= tl;

      const up = Math.abs(ty) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      let nx = ty * up[2] - tz * up[1];
      let ny = tz * up[0] - tx * up[2];
      let nz = tx * up[1] - ty * up[0];
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= nl;
      ny /= nl;
      nz /= nl;

      const bx = ty * nz - tz * ny;
      const by = tz * nx - tx * nz;
      const bz = tx * ny - ty * nx;

      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * TAU;
        const c = Math.cos(a) * tubeR;
        const s = Math.sin(a) * tubeR;
        V.push([cx + c * nx + s * bx, cy + c * ny + s * by, cz + c * nz + s * bz]);
      }
    }

    for (let i = 0; i < segs; i++) {
      for (let k = 0; k < sides; k++) {
        const cur = i * sides + k;
        E.push([cur, i * sides + (k + 1) % sides]);
        E.push([cur, ((i + 1) % segs) * sides + k]);

        const a = i * sides + k;
        const b = i * sides + (k + 1) % sides;
        const c = ((i + 1) % segs) * sides + (k + 1) % sides;
        const d = ((i + 1) % segs) * sides + k;
        F.push([a, b, c, d]);
      }
    }

    return { V, E, F };
  }

  function detailCount(maxCount, detail = 1, minCount = 3, step = 1) {
    const d = Math.max(0.5, Math.min(1.4, Number(detail) || 1));
    const scaled = Math.max(minCount, maxCount * d);
    const snapped = Math.max(minCount, Math.round(scaled / step) * step);
    return snapped;
  }

  function triangulateFaces(faces) {
    const tris = [];
    for (const face of faces || []) {
      if (!face || face.length < 3) continue;
      if (face.length === 3) {
        tris.push([face[0], face[1], face[2]]);
      } else {
        for (let i = 1; i < face.length - 1; i++) {
          tris.push([face[0], face[i], face[i + 1]]);
        }
      }
    }
    return tris;
  }

  function buildEdgesFromFaces(faces) {
    const edgeSet = new Set();
    const E = [];

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    for (const face of faces) {
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return E;
  }

  function subdivideMesh(model, iterations = 1) {
    let V = model.V.map((v) => [v[0], v[1], v[2]]);
    let triFaces = triangulateFaces(model.F || []);

    if (!triFaces.length) return model;

    const iterCount = Math.max(0, Math.floor(iterations));
    for (let it = 0; it < iterCount; it++) {
      const midpointCache = new Map();
      const nextFaces = [];

      function midpointIndex(i, j) {
        const lo = Math.min(i, j);
        const hi = Math.max(i, j);
        const key = `${lo}|${hi}`;
        const cached = midpointCache.get(key);
        if (cached !== undefined) return cached;

        const a = V[lo];
        const b = V[hi];
        const idx = V.length;
        V.push([
          (a[0] + b[0]) * 0.5,
          (a[1] + b[1]) * 0.5,
          (a[2] + b[2]) * 0.5,
        ]);
        midpointCache.set(key, idx);
        return idx;
      }

      for (const [a, b, c] of triFaces) {
        const ab = midpointIndex(a, b);
        const bc = midpointIndex(b, c);
        const ca = midpointIndex(c, a);

        nextFaces.push([a, ab, ca]);
        nextFaces.push([ab, b, bc]);
        nextFaces.push([ca, bc, c]);
        nextFaces.push([ab, bc, ca]);
      }

      triFaces = nextFaces;
    }

    const F = triFaces;
    const E = buildEdgesFromFaces(F);
    return { V, E, F };
  }

  global.WireframeGeometry = { buildRevolution, buildTube, subdivideMesh, detailCount };
})(window);
