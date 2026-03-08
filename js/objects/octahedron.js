'use strict';

(function registerOctahedron(global) {
  function buildOctahedron() {
    const s = 1.0;
    const V = [[0, s, 0], [0, -s, 0], [s, 0, 0], [-s, 0, 0], [0, 0, s], [0, 0, -s]];
    const E = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];
    const F = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5],
    ];
    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Octahedron', build: buildOctahedron });
})(window);
