'use strict';

(function registerPyramid(global) {
  const { subdivideMesh } = global.WireframeGeometry;

  function buildPyramid(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const b = 0.95;
    const h = 1.15;

    const V = [
      [-b, -b, -b],
      [b, -b, -b],
      [b, -b, b],
      [-b, -b, b],
      [0, h, 0],
    ];

    const E = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
    ];

    const F = [
      [0, 1, 2, 3],
      [0, 4, 1],
      [1, 4, 2],
      [2, 4, 3],
      [3, 4, 0],
    ];

    const iterations = detail < 0.84 ? 0 : (detail < 1.24 ? 1 : 2);
    return subdivideMesh({ V, E, F }, iterations);
  }

  global.WireframeObjectRegistry.register({ name: 'Pyramid', build: buildPyramid });
})(window);
