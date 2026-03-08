'use strict';

(function registerIcosahedron(global) {
  function buildIcosahedron() {
    const t = (1 + Math.sqrt(5)) / 2;
    const s = 0.90 / Math.sqrt(1 + t * t);
    const V = [
      [0, s, t * s], [0, -s, t * s], [0, s, -t * s], [0, -s, -t * s],
      [s, t * s, 0], [-s, t * s, 0], [s, -t * s, 0], [-s, -t * s, 0],
      [t * s, 0, s], [t * s, 0, -s], [-t * s, 0, s], [-t * s, 0, -s],
    ];
    const el2 = 4 * s * s;
    const E = [];
    const F = [];

    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const dx = V[i][0] - V[j][0];
        const dy = V[i][1] - V[j][1];
        const dz = V[i][2] - V[j][2];
        if (Math.abs(dx * dx + dy * dy + dz * dz - el2) < 0.01) E.push([i, j]);
      }
    }

    // Faces are all vertex triples with equal edge lengths.
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
          const dx1 = V[i][0] - V[j][0];
          const dy1 = V[i][1] - V[j][1];
          const dz1 = V[i][2] - V[j][2];
          const d1 = dx1 * dx1 + dy1 * dy1 + dz1 * dz1;

          const dx2 = V[i][0] - V[k][0];
          const dy2 = V[i][1] - V[k][1];
          const dz2 = V[i][2] - V[k][2];
          const d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

          const dx3 = V[j][0] - V[k][0];
          const dy3 = V[j][1] - V[k][1];
          const dz3 = V[j][2] - V[k][2];
          const d3 = dx3 * dx3 + dy3 * dy3 + dz3 * dz3;

          if (Math.abs(d1 - el2) < 0.01 && Math.abs(d2 - el2) < 0.01 && Math.abs(d3 - el2) < 0.01) {
            F.push([i, j, k]);
          }
        }
      }
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Icosahedron', build: buildIcosahedron });
})(window);
