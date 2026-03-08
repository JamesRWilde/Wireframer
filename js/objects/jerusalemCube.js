'use strict';

(function registerJerusalemCube(global) {
  const meshCache = new Map();

  function clampDetail(detail) {
    return Math.max(0.5, Math.min(1.4, Number(detail) || 1));
  }

  function iterationFromDetail(detail) {
    const d = clampDetail(detail);
    if (d < 0.72) return 0;
    if (d < 1.02) return 1;
    if (d < 1.30) return 2;
    return 4;
  }

  function addFace(faceMap, a, b, c, d) {
    const sorted = [a, b, c, d].sort((x, y) => x - y);
    const key = `${sorted[0]}|${sorted[1]}|${sorted[2]}|${sorted[3]}`;
    const existing = faceMap.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }
    faceMap.set(key, { count: 1, face: [a, b, c, d] });
  }

  function buildJerusalemCube(options = {}) {
    const iterations = iterationFromDetail(options.detail);
    const cached = meshCache.get(iterations);
    if (cached) return cached;

    const cubes = [{ cx: 0, cy: 0, cz: 0, hs: 0.95 }];

    for (let it = 0; it < iterations; it++) {
      const next = [];
      for (const cube of cubes) {
        const hs = cube.hs;

        // Canonical Jerusalem ratio from 2s + s^2 = 1 => s = sqrt(2) - 1.
        // Corner child side = s * parent side, edge child side = s^2 * parent side.
        const s = Math.sqrt(2) - 1;
        const cornerHs = hs * s;
        const edgeHs = hs * s * s;

        const cornerOffset = hs - cornerHs;
        const edgeOffset = hs - edgeHs;

        // 8 corners.
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            for (const sz of [-1, 1]) {
              next.push({
                cx: cube.cx + sx * cornerOffset,
                cy: cube.cy + sy * cornerOffset,
                cz: cube.cz + sz * cornerOffset,
                hs: cornerHs,
              });
            }
          }
        }

        // 12 edge-centered cubes.
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            next.push({ cx: cube.cx, cy: cube.cy + sy * edgeOffset, cz: cube.cz + sz * edgeOffset, hs: edgeHs });
          }
        }
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            next.push({ cx: cube.cx + sx * edgeOffset, cy: cube.cy, cz: cube.cz + sz * edgeOffset, hs: edgeHs });
          }
        }
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            next.push({ cx: cube.cx + sx * edgeOffset, cy: cube.cy + sy * edgeOffset, cz: cube.cz, hs: edgeHs });
          }
        }
      }
      cubes.length = 0;
      cubes.push(...next);
    }

    const V = [];
    const E = [];
    const F = [];
    const vertexMap = new Map();
    const faceMap = new Map();
    const edgeSet = new Set();

    function vertexIndex(x, y, z) {
      const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
      const cachedIdx = vertexMap.get(key);
      if (cachedIdx !== undefined) return cachedIdx;
      const idx = V.length;
      V.push([x, y, z]);
      vertexMap.set(key, idx);
      return idx;
    }

    for (const cube of cubes) {
      const x0 = cube.cx - cube.hs;
      const x1 = cube.cx + cube.hs;
      const y0 = cube.cy - cube.hs;
      const y1 = cube.cy + cube.hs;
      const z0 = cube.cz - cube.hs;
      const z1 = cube.cz + cube.hs;

      const v000 = vertexIndex(x0, y0, z0);
      const v001 = vertexIndex(x0, y0, z1);
      const v010 = vertexIndex(x0, y1, z0);
      const v011 = vertexIndex(x0, y1, z1);
      const v100 = vertexIndex(x1, y0, z0);
      const v101 = vertexIndex(x1, y0, z1);
      const v110 = vertexIndex(x1, y1, z0);
      const v111 = vertexIndex(x1, y1, z1);

      addFace(faceMap, v100, v110, v111, v101); // +X
      addFace(faceMap, v000, v001, v011, v010); // -X
      addFace(faceMap, v010, v011, v111, v110); // +Y
      addFace(faceMap, v000, v100, v101, v001); // -Y
      addFace(faceMap, v001, v101, v111, v011); // +Z
      addFace(faceMap, v000, v010, v110, v100); // -Z
    }

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
      const face = entry.face;
      F.push(face);
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    const mesh = { V, E, F };
    meshCache.set(iterations, mesh);
    return mesh;
  }

  global.WireframeObjectRegistry.register({ name: 'Jerusalem Cube', build: buildJerusalemCube });
})(window);
