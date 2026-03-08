'use strict';

(function registerMengerSponge(global) {
  const { subdivideMesh } = global.WireframeGeometry;
  const BASE_ITERATION = 2;
  let baseMesh = null;
  const detailCache = new Map();

  function clampDetail(detail) {
    return Math.max(0.5, Math.min(1.4, Number(detail) || 1));
  }

  function subdivisionFromDetail(detail) {
    const d = clampDetail(detail);
    return d >= 1.02 ? 1 : 0;
  }

  function isFilledCell(x, y, z, iterations) {
    let cx = x;
    let cy = y;
    let cz = z;

    for (let i = 0; i < iterations; i++) {
      const dx = cx % 3;
      const dy = cy % 3;
      const dz = cz % 3;
      const ones = (dx === 1 ? 1 : 0) + (dy === 1 ? 1 : 0) + (dz === 1 ? 1 : 0);
      if (ones >= 2) return false;
      cx = Math.floor(cx / 3);
      cy = Math.floor(cy / 3);
      cz = Math.floor(cz / 3);
    }

    return true;
  }

  function buildMengerAtIteration(iterations) {
    const size = Math.pow(3, iterations);
    const filled = new Set();

    function key(x, y, z) {
      return x + size * (y + size * z);
    }

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (isFilledCell(x, y, z, iterations)) filled.add(key(x, y, z));
        }
      }
    }

    const V = [];
    const E = [];
    const F = [];
    const edgeSet = new Set();
    const vertexMap = new Map();
    const extent = 0.9;
    const cell = (extent * 2) / size;

    function vertexIndex(ix, iy, iz) {
      const k = `${ix},${iy},${iz}`;
      const cached = vertexMap.get(k);
      if (cached !== undefined) return cached;
      const idx = V.length;
      V.push([
        -extent + ix * cell,
        -extent + iy * cell,
        -extent + iz * cell,
      ]);
      vertexMap.set(k, idx);
      return idx;
    }

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const k = `${lo}|${hi}`;
      if (edgeSet.has(k)) return;
      edgeSet.add(k);
      E.push([lo, hi]);
    }

    function addFace(a, b, c, d) {
      F.push([a, b, c, d]);
      addEdge(a, b);
      addEdge(b, c);
      addEdge(c, d);
      addEdge(d, a);
    }

    function filledAt(x, y, z) {
      if (x < 0 || y < 0 || z < 0 || x >= size || y >= size || z >= size) return false;
      return filled.has(key(x, y, z));
    }

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (!filledAt(x, y, z)) continue;

          if (!filledAt(x + 1, y, z)) {
            addFace(
              vertexIndex(x + 1, y, z),
              vertexIndex(x + 1, y + 1, z),
              vertexIndex(x + 1, y + 1, z + 1),
              vertexIndex(x + 1, y, z + 1)
            );
          }

          if (!filledAt(x - 1, y, z)) {
            addFace(
              vertexIndex(x, y, z),
              vertexIndex(x, y, z + 1),
              vertexIndex(x, y + 1, z + 1),
              vertexIndex(x, y + 1, z)
            );
          }

          if (!filledAt(x, y + 1, z)) {
            addFace(
              vertexIndex(x, y + 1, z),
              vertexIndex(x, y + 1, z + 1),
              vertexIndex(x + 1, y + 1, z + 1),
              vertexIndex(x + 1, y + 1, z)
            );
          }

          if (!filledAt(x, y - 1, z)) {
            addFace(
              vertexIndex(x, y, z),
              vertexIndex(x + 1, y, z),
              vertexIndex(x + 1, y, z + 1),
              vertexIndex(x, y, z + 1)
            );
          }

          if (!filledAt(x, y, z + 1)) {
            addFace(
              vertexIndex(x, y, z + 1),
              vertexIndex(x + 1, y, z + 1),
              vertexIndex(x + 1, y + 1, z + 1),
              vertexIndex(x, y + 1, z + 1)
            );
          }

          if (!filledAt(x, y, z - 1)) {
            addFace(
              vertexIndex(x, y, z),
              vertexIndex(x, y + 1, z),
              vertexIndex(x + 1, y + 1, z),
              vertexIndex(x + 1, y, z)
            );
          }
        }
      }
    }

    return { V, E, F };
  }

  function getBaseMesh() {
    if (!baseMesh) baseMesh = buildMengerAtIteration(BASE_ITERATION);
    return baseMesh;
  }

  function buildMengerSponge(options = {}) {
    const subdiv = subdivisionFromDetail(options.detail);
    const key = `sub:${subdiv}`;
    const cached = detailCache.get(key);
    if (cached) return cached;

    const mesh = subdiv > 0 ? subdivideMesh(getBaseMesh(), subdiv) : getBaseMesh();
    detailCache.set(key, mesh);
    return mesh;
  }

  global.WireframeObjectRegistry.register({ name: 'Menger Sponge', build: buildMengerSponge });
})(window);
