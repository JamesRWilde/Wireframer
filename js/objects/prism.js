'use strict';

(function registerPrism(global) {
  const { subdivideMesh } = global.WireframeGeometry;

  function buildEdgesFromFaces(faces) {
    const E = [];
    const seen = new Set();

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (seen.has(key)) return;
      seen.add(key);
      E.push([lo, hi]);
    }

    for (const face of faces) {
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return E;
  }

  function buildPrism(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));

    // Triangular prism: front and back triangles connected by 3 rectangular faces.
    const halfDepth = 0.92;
    const triR = 0.92;

    // Front triangle (z = -depth), then back triangle (z = +depth).
    const V = [
      [0, triR, -halfDepth],
      [-0.80 * triR, -0.58 * triR, -halfDepth],
      [0.80 * triR, -0.58 * triR, -halfDepth],

      [0, triR, halfDepth],
      [-0.80 * triR, -0.58 * triR, halfDepth],
      [0.80 * triR, -0.58 * triR, halfDepth],
    ];

    const F = [
      [0, 2, 1],
      [3, 4, 5],
      [0, 1, 4, 3],
      [1, 2, 5, 4],
      [2, 0, 3, 5],
    ];

    const base = { V, E: buildEdgesFromFaces(F), F };
    const iterations = detail < 0.68
      ? 0
      : detail < 0.92
        ? 1
        : detail < 1.16
          ? 2
          : 3;
    return subdivideMesh(base, iterations);
  }

  global.WireframeObjectRegistry.register({ name: 'Prism', build: buildPrism });
})(window);
