'use strict';

(function registerCube(global) {
  const { subdivideMesh } = global.WireframeGeometry;

  function buildCube(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const s = 0.82;
    const F = [
      [0, 1, 3, 2],
      [4, 6, 7, 5],
      [0, 4, 5, 1],
      [2, 3, 7, 6],
      [0, 2, 6, 4],
      [1, 5, 7, 3],
    ];
    const base = {
      V: [[-s, -s, -s], [-s, -s, s], [-s, s, -s], [-s, s, s], [s, -s, -s], [s, -s, s], [s, s, -s], [s, s, s]],
      E: [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]],
      F,
    };
    const iterations = detail < 0.68
      ? 0
      : detail < 0.92
        ? 1
        : detail < 1.16
          ? 2
          : 3;
    return subdivideMesh(base, iterations);
  }

  global.WireframeObjectRegistry.register({ name: 'Cube', build: buildCube });
})(window);
