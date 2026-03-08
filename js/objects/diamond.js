'use strict';

(function registerDiamond(global) {
  function buildDiamond() {
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

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Diamond', build: buildDiamond });
})(window);
