'use strict';

(function registerHilbertCurve(global) {
  const BASE_ORDER = 3;
  let basePoints = null;
  const meshCache = new Map();

  function clampDetail(detail) {
    return Math.max(0.5, Math.min(1.4, Number(detail) || 1));
  }

  function tubeFromDetail(detail) {
    const d = clampDetail(detail);
    const t = (d - 0.5) / 0.9;
    const sides = Math.max(6, Math.min(10, Math.round(6 + t * 4)));
    const radius = 0.032 + t * 0.014;
    return { sides, radius };
  }
  function getBasePoints() {
    if (basePoints) return basePoints;

    const points2D = [];
    hilbert2D(0, 0, 1, 0, 0, 1, BASE_ORDER, points2D);

    const points = [];
    for (const p of points2D) {
      points.push([
        (p[0] - 0.5) * 1.9,
        (p[1] - 0.5) * 1.9,
        0,
      ]);
    }

    basePoints = points;
    return basePoints;
  }


  function hilbert2D(x0, y0, xi, xj, yi, yj, n, out) {
    if (n <= 0) {
      const x = x0 + (xi + yi) * 0.5;
      const y = y0 + (xj + yj) * 0.5;
      out.push([x, y]);
      return;
    }

    const hxi = xi * 0.5;
    const hxj = xj * 0.5;
    const hyi = yi * 0.5;
    const hyj = yj * 0.5;

    hilbert2D(x0, y0, hyi, hyj, hxi, hxj, n - 1, out);
    hilbert2D(x0 + hxi, y0 + hxj, hxi, hxj, hyi, hyj, n - 1, out);
    hilbert2D(x0 + hxi + hyi, y0 + hxj + hyj, hxi, hxj, hyi, hyj, n - 1, out);
    hilbert2D(x0 + hxi + yi, y0 + hxj + yj, -hyi, -hyj, -hxi, -hxj, n - 1, out);
  }

  function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    if (len < 1e-8) return [0, 1, 0];
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  function buildTubeFromPolyline(points, sides, radius) {
    const V = [];
    const E = [];
    const F = [];
    const edgeSet = new Set();

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of points) {
      if (p[2] < minZ) minZ = p[2];
      if (p[2] > maxZ) maxZ = p[2];
    }
    const planarZ = maxZ - minZ < 1e-6;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      const t = normalize([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);

      let n;
      let b;
      if (planarZ) {
        // For planar curves, lock a consistent frame to avoid perceived tube thickness wobble.
        n = [0, 0, 1];
        b = normalize(cross(t, n));
      } else {
        const up = Math.abs(t[1]) < 0.92 ? [0, 1, 0] : [1, 0, 0];
        n = normalize(cross(t, up));
        b = normalize(cross(t, n));
      }

      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2;
        const ca = Math.cos(a) * radius;
        const sa = Math.sin(a) * radius;
        V.push([
          p[0] + n[0] * ca + b[0] * sa,
          p[1] + n[1] * ca + b[1] * sa,
          p[2] + n[2] * ca + b[2] * sa,
        ]);
      }
    }

    const rings = points.length;
    for (let i = 0; i < rings; i++) {
      for (let k = 0; k < sides; k++) {
        const cur = i * sides + k;
        const nxt = i * sides + ((k + 1) % sides);
        addEdge(cur, nxt);
      }
    }

    for (let i = 0; i < rings - 1; i++) {
      for (let k = 0; k < sides; k++) {
        const kn = (k + 1) % sides;
        const a = i * sides + k;
        const b = i * sides + kn;
        const c = (i + 1) * sides + kn;
        const d = (i + 1) * sides + k;
        F.push([a, b, c, d]);
        addEdge(a, d);
      }
    }

    return { V, E, F };
  }

  function buildHilbertCurve(options = {}) {
    const tube = tubeFromDetail(options.detail);
    const key = `${tube.sides}|${Math.round(tube.radius * 10000)}`;
    const cached = meshCache.get(key);
    if (cached) return cached;

    const mesh = buildTubeFromPolyline(getBasePoints(), tube.sides, tube.radius);
    meshCache.set(key, mesh);
    return mesh;
  }

  global.WireframeObjectRegistry.register({ name: 'Hilbert Curve', build: buildHilbertCurve });
})(window);
