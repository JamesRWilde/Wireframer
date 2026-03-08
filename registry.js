'use strict';

(function initObjectRegistry(global) {
  const objects = [];

  function buildEdgesFromFaces(faces) {
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

    for (const face of faces) {
      if (!Array.isArray(face) || face.length < 2) continue;
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }
    return E;
  }

  function normalizeVec3List(list, fieldName) {
    if (!Array.isArray(list)) throw new Error(`Invalid mesh: expected array for ${fieldName}`);
    return list.map((v) => {
      if (!Array.isArray(v) || v.length < 3) throw new Error(`Invalid mesh ${fieldName} entry; expected [x,y,z]`);
      return [Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0];
    });
  }

  function normalizeIndexFaces(list, fieldName) {
    if (!Array.isArray(list)) throw new Error(`Invalid mesh: expected array for ${fieldName}`);
    return list
      .filter((f) => Array.isArray(f) && f.length >= 3)
      .map((f) => f.map((idx) => Math.max(0, Math.floor(Number(idx) || 0))));
  }

  function normalizeIndexEdges(list, fieldName) {
    if (!Array.isArray(list)) return null;
    return list
      .filter((e) => Array.isArray(e) && e.length >= 2)
      .map((e) => [Math.max(0, Math.floor(Number(e[0]) || 0)), Math.max(0, Math.floor(Number(e[1]) || 0))]);
  }

  function toCanonicalIndexedMesh(rawMesh) {
    if (!rawMesh || typeof rawMesh !== 'object') {
      throw new Error('Invalid mesh returned by build(); expected object');
    }

    const hasCanonical = Array.isArray(rawMesh.positions) && Array.isArray(rawMesh.faces);
    const hasLegacy = Array.isArray(rawMesh.V) && Array.isArray(rawMesh.F);

    const positions = hasCanonical
      ? normalizeVec3List(rawMesh.positions, 'positions')
      : normalizeVec3List(rawMesh.V, 'V');
    const faces = hasCanonical
      ? normalizeIndexFaces(rawMesh.faces, 'faces')
      : normalizeIndexFaces(rawMesh.F, 'F');

    const edgesIn = hasCanonical ? rawMesh.edges : rawMesh.E;
    const edges = normalizeIndexEdges(edgesIn, hasCanonical ? 'edges' : 'E') || buildEdgesFromFaces(faces);

    return {
      format: 'indexed-polygons-v1',
      positions,
      faces,
      edges,
      shadingMode: rawMesh.shadingMode,
      creaseAngleDeg: rawMesh.creaseAngleDeg,
    };
  }

  global.WireframeObjectRegistry = {
    register(objectDef) {
      if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
        throw new Error('Invalid object definition. Expected { name: string, build: function }.');
      }

      const wrapped = {
        ...objectDef,
        meshFormat: 'indexed-polygons-v1',
        build(options) {
          const rawMesh = objectDef.build(options);
          return toCanonicalIndexedMesh(rawMesh);
        },
      };

      objects.push(wrapped);
    },
  };

  // Backward-compatible global consumed by app scripts.
  global.OBJECTS = objects;
})(window);
