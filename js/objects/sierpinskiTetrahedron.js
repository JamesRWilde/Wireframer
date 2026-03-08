'use strict';

(function registerSierpinskiTetrahedron(global) {
  function iterationFromDetail(detail) {
    const d = Math.max(0.5, Math.min(1.4, Number(detail) || 1));
    if (d < 0.70) return 0;
    if (d < 0.92) return 1;
    if (d < 1.12) return 2;
    if (d < 1.30) return 3;
    return 4;
  }

  function buildSierpinskiTetrahedron(options = {}) {
    const iterations = iterationFromDetail(options.detail);
    const s = 0.95;
    const V = [
      [s, s, s],
      [s, -s, -s],
      [-s, s, -s],
      [-s, -s, s],
    ];

    let tetrahedra = [[0, 1, 2, 3]];

    for (let it = 0; it < iterations; it++) {
      const midpointCache = new Map();
      const next = [];

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

      for (const tet of tetrahedra) {
        const a = tet[0];
        const b = tet[1];
        const c = tet[2];
        const d = tet[3];
        const ab = midpointIndex(a, b);
        const ac = midpointIndex(a, c);
        const ad = midpointIndex(a, d);
        const bc = midpointIndex(b, c);
        const bd = midpointIndex(b, d);
        const cd = midpointIndex(c, d);

        next.push([a, ab, ac, ad]);
        next.push([ab, b, bc, bd]);
        next.push([ac, bc, c, cd]);
        next.push([ad, bd, cd, d]);
      }

      tetrahedra = next;
    }

    const faceMap = new Map();
    const center = [0, 0, 0];

    function recordFace(a, b, c) {
      const sorted = [a, b, c].sort((x, y) => x - y);
      const key = `${sorted[0]}|${sorted[1]}|${sorted[2]}`;
      const existing = faceMap.get(key);
      if (existing) {
        existing.count += 1;
        return;
      }
      faceMap.set(key, { count: 1, face: [a, b, c] });
    }

    for (const tet of tetrahedra) {
      const a = tet[0];
      const b = tet[1];
      const c = tet[2];
      const d = tet[3];
      recordFace(a, c, b);
      recordFace(a, b, d);
      recordFace(a, d, c);
      recordFace(b, c, d);
    }

    const F = [];
    const E = [];
    const edgeSet = new Set();

    function addEdge(i, j) {
      const lo = Math.min(i, j);
      const hi = Math.max(i, j);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    function orientOutward(face) {
      const a = V[face[0]];
      const b = V[face[1]];
      const c = V[face[2]];

      const ux = b[0] - a[0];
      const uy = b[1] - a[1];
      const uz = b[2] - a[2];
      const vx = c[0] - a[0];
      const vy = c[1] - a[1];
      const vz = c[2] - a[2];

      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;

      const cx = (a[0] + b[0] + c[0]) / 3;
      const cy = (a[1] + b[1] + c[1]) / 3;
      const cz = (a[2] + b[2] + c[2]) / 3;

      const ox = cx - center[0];
      const oy = cy - center[1];
      const oz = cz - center[2];

      if (nx * ox + ny * oy + nz * oz < 0) {
        return [face[0], face[2], face[1]];
      }
      return face;
    }

    for (const entry of faceMap.values()) {
      if (entry.count !== 1) continue;
      const face = orientOutward(entry.face);
      F.push(face);
      addEdge(face[0], face[1]);
      addEdge(face[1], face[2]);
      addEdge(face[2], face[0]);
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Sierpinski Tetrahedron', build: buildSierpinskiTetrahedron });
})(window);
