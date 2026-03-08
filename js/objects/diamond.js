'use strict';

(function registerDiamond(global) {
  const { subdivideMesh } = global.WireframeGeometry;

  function buildDiamond(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const r = 0.95;
    const yTop = 1.15;
    const yMid = 0.0;
    const yBot = -1.15;

    // Square bipyramid (two pyramids base-to-base).
    const V = [
      [0, yTop, 0],
      [-r, yMid, 0],
      [0, yMid, r],
      [r, yMid, 0],
      [0, yMid, -r],
      [0, yBot, 0],
    ];

    const E = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
      [5, 1], [5, 2], [5, 3], [5, 4],
    ];

    const F = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],
    ];

    const iterations = detail < 0.75 ? 0 : (detail < 1.25 ? 1 : 2);
    return subdivideMesh({ V, E, F }, iterations);
  }

  global.WireframeObjectRegistry.register({ name: 'Diamond', build: buildDiamond });
})(window);
