'use strict';

(function registerStaticMeshMap(global) {
  if (global.__wireframeStaticMeshMapRegistered) return;

  const registry = global.WireframeObjectRegistry;
  const payloads = global.WireframeMeshPayloads || {};
  if (!registry || typeof registry.register !== 'function') return;

  const MESH_MAP = [
    { name: 'Capsule', file: 'capsule.mesh.json' },
    { name: 'Dog', file: 'dog.mesh.json' },
    { name: 'Cat', file: 'cat.mesh.json' },
    { name: 'Car', file: 'car.mesh.json' },
    { name: 'Tree', file: 'tree.mesh.json' },
    { name: 'Acorn', file: 'acorn.mesh.json' },
    { name: 'Pinecone', file: 'pinecone.mesh.json' },
    { name: 'House', file: 'house.mesh.json' },
    { name: 'Rocket', file: 'rocket.mesh.json' },
    { name: 'Cinquefoil Knot', file: 'cinquefoil-knot.mesh.json' },
    { name: 'Cone', file: 'cone.mesh.json' },
    { name: 'Cube', file: 'cube.mesh.json' },
    { name: 'Cylinder', file: 'cylinder.mesh.json' },
    { name: 'Diamond', file: 'diamond.mesh.json' },
    { name: 'Hilbert Curve', file: 'hilbert-curve.mesh.json' },
    { name: 'Hyperboloid', file: 'hyperboloid.mesh.json' },
    { name: 'Icosahedron', file: 'icosahedron.mesh.json' },
    { name: 'Jerusalem Cube', file: 'jerusalem-cube.mesh.json' },
    { name: 'Menger Sponge', file: 'menger-sponge.mesh.json' },
    { name: 'Mandelbulb', file: 'mandelbulb.mesh.json' },
    { name: 'Mobius Strip', file: 'mobius-strip.mesh.json' },
    { name: 'Octahedron', file: 'octahedron.mesh.json' },
    { name: 'Prism', file: 'prism.mesh.json' },
    { name: 'Pyramid', file: 'pyramid.mesh.json' },
    { name: 'Sierpinski Pyramid', file: 'sierpinski-pyramid.mesh.json' },
    { name: 'Sierpinski Tetrahedron', file: 'sierpinski-tetrahedron.mesh.json' },
    { name: 'Sphere', file: 'sphere.mesh.json' },
    { name: 'Spring', file: 'spring.mesh.json' },
    { name: 'Star Prism', file: 'star-prism.mesh.json' },
    { name: 'Tetrahedron', file: 'tetrahedron.mesh.json' },
    { name: 'Torus', file: 'torus.mesh.json' },
    { name: 'Torus Knot', file: 'torus-knot.mesh.json' },
    { name: 'Wine Glass', file: 'wine-glass.mesh.json' },
  ];

  function selectLodMesh(payload, detail) {
    const lods = Array.isArray(payload?.lods) ? payload.lods : null;
    if (!lods || !lods.length) return payload;

    const d = Math.max(0.5, Math.min(1.4, Number(detail) || 1));
    let best = lods[0];
    let bestDist = Math.abs((Number(best.detail) || 1) - d);

    for (let i = 1; i < lods.length; i++) {
      const cand = lods[i];
      const dist = Math.abs((Number(cand.detail) || 1) - d);
      if (dist < bestDist) {
        best = cand;
        bestDist = dist;
      }
    }

    return {
      format: payload.format || 'indexed-polygons-v1',
      name: payload.name,
      shadingMode: payload.shadingMode,
      creaseAngleDeg: payload.creaseAngleDeg,
      positions: best.positions,
      faces: best.faces,
      edges: best.edges,
    };
  }

  for (const entry of MESH_MAP) {
    const payload = payloads[entry.file];
    if (!payload) {
      throw new Error('Missing static mesh payload for ' + entry.file);
    }

    registry.register({
      name: entry.name,
      build(options = {}) {
        return selectLodMesh(payload, options.detail);
      },
    });
  }

  global.__wireframeStaticMeshMapRegistered = true;
  global.WireframeObjectsReady = Promise.resolve(global.OBJECTS || []);
})(window);
