'use strict';

(function registerTetrahedron(global) {
  const { subdivideMesh } = global.WireframeGeometry;

  function buildTetrahedron(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const s = 0.95;
    const V = [
      [s, s, s],
      [s, -s, -s],
      [-s, s, -s],
      [-s, -s, s],
    ];
    const E = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [2, 3],
    ];
    const F = [
      [0, 2, 1],
      [0, 1, 3],
      [0, 3, 2],
      [1, 2, 3],
    ];

    const iterations = detail < 0.8 ? 0 : (detail < 1.22 ? 1 : 2);
    return subdivideMesh({ V, E, F }, iterations);
  }

  global.WireframeObjectRegistry.register({ name: 'Tetrahedron', build: buildTetrahedron });
})(window);
