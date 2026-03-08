'use strict';

(function registerSierpinskiPyramid(global) {
  const { subdivideMesh } = global.WireframeGeometry;
  const BASE_ITERATION = 2;
  let baseMesh = null;
  const detailCache = new Map();

  function clampDetail(detail) {
    return Math.max(0.5, Math.min(1.4, Number(detail) || 1));
  }

  function subdivisionFromDetail(detail) {
    const d = clampDetail(detail);
    return d >= 1.06 ? 1 : 0;
  }

  function buildSierpinskiAtIteration(iterations) {
    const base = [
      [-0.90, -0.80, -0.90],
      [0.90, -0.80, -0.90],
      [0.90, -0.80, 0.90],
      [-0.90, -0.80, 0.90],
      [0.0, 1.10, 0.0],
    ];

    let pyramids = [base];

    for (let it = 0; it < iterations; it++) {
      const next = [];
      for (const pyr of pyramids) {
        const baseCenter = [
          (pyr[0][0] + pyr[1][0] + pyr[2][0] + pyr[3][0]) * 0.25,
          (pyr[0][1] + pyr[1][1] + pyr[2][1] + pyr[3][1]) * 0.25,
          (pyr[0][2] + pyr[1][2] + pyr[2][2] + pyr[3][2]) * 0.25,
        ];
        const childCenters = [pyr[0], pyr[1], pyr[2], pyr[3], baseCenter, pyr[4]];

        for (const anchor of childCenters) {
          const child = [];
          for (let i = 0; i < 5; i++) {
            const p = pyr[i];
            child.push([
              anchor[0] + (p[0] - anchor[0]) * 0.5,
              anchor[1] + (p[1] - anchor[1]) * 0.5,
              anchor[2] + (p[2] - anchor[2]) * 0.5,
            ]);
          }
          next.push(child);
        }
      }
      pyramids = next;
    }

    const V = [];
    const vertexMap = new Map();
    const faceMap = new Map();

    function vertexIndex(v) {
      const key = `${v[0].toFixed(6)},${v[1].toFixed(6)},${v[2].toFixed(6)}`;
      const cached = vertexMap.get(key);
      if (cached !== undefined) return cached;
      const idx = V.length;
      V.push([v[0], v[1], v[2]]);
      vertexMap.set(key, idx);
      return idx;
    }

    function recordFace(face) {
      const sorted = face.slice().sort((a, b) => a - b);
      const key = sorted.join('|');
      const entry = faceMap.get(key);
      if (entry) {
        entry.count += 1;
        return;
      }
      faceMap.set(key, { count: 1, face });
    }

    function orientOutward(face) {
      let nx = 0;
      let ny = 0;
      let nz = 0;
      for (let i = 0; i < face.length; i++) {
        const a = V[face[i]];
        const b = V[face[(i + 1) % face.length]];
        nx += (a[1] - b[1]) * (a[2] + b[2]);
        ny += (a[2] - b[2]) * (a[0] + b[0]);
        nz += (a[0] - b[0]) * (a[1] + b[1]);
      }

      let cx = 0;
      let cy = 0;
      let cz = 0;
      for (const idx of face) {
        cx += V[idx][0];
        cy += V[idx][1];
        cz += V[idx][2];
      }
      const inv = 1 / face.length;
      cx *= inv;
      cy *= inv;
      cz *= inv;

      if (nx * cx + ny * cy + nz * cz < 0) {
        const out = face.slice();
        out.reverse();
        return out;
      }
      return face;
    }

    for (const pyr of pyramids) {
      const idx = [
        vertexIndex(pyr[0]),
        vertexIndex(pyr[1]),
        vertexIndex(pyr[2]),
        vertexIndex(pyr[3]),
        vertexIndex(pyr[4]),
      ];

      recordFace([idx[0], idx[1], idx[2], idx[3]]);
      recordFace([idx[0], idx[4], idx[1]]);
      recordFace([idx[1], idx[4], idx[2]]);
      recordFace([idx[2], idx[4], idx[3]]);
      recordFace([idx[3], idx[4], idx[0]]);
    }

    const F = [];
    const E = [];
    const edgeSet = new Set();

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    for (const entry of faceMap.values()) {
      if (entry.count !== 1) continue;
      const face = orientOutward(entry.face);
      F.push(face);
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return { V, E, F };
  }

  function getBaseMesh() {
    if (!baseMesh) baseMesh = buildSierpinskiAtIteration(BASE_ITERATION);
    return baseMesh;
  }

  function buildSierpinskiPyramid(options = {}) {
    const subdiv = subdivisionFromDetail(options.detail);
    const key = `sub:${subdiv}`;
    const cached = detailCache.get(key);
    if (cached) return cached;

    const mesh = subdiv > 0 ? subdivideMesh(getBaseMesh(), subdiv) : getBaseMesh();
    detailCache.set(key, mesh);
    return mesh;
  }

  global.WireframeObjectRegistry.register({ name: 'Sierpinski Pyramid', build: buildSierpinskiPyramid });
})(window);
