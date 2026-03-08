'use strict';

(function registerCone(global) {
  function buildCone(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // Non-linear scaling keeps low detail practical while allowing very dense max detail.
    const eased = Math.pow(Math.max(0, Math.min(1, t)), 2.2);
    const minSegs = 5;
    const maxSegs = 40;
    const segs = Math.round(minSegs + (maxSegs - minSegs) * eased);
    const radius = 0.98;
    const yTop = 1.08;
    const yBase = -1.0;

    // Vertex 0 is the apex, 1 is the base center, then ring vertices.
    const V = [[0, yTop, 0], [0, yBase, 0]];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      V.push([radius * Math.cos(a), yBase, radius * Math.sin(a)]);
    }

    const E = [];
    const F = [];

    for (let i = 0; i < segs; i++) {
      const ni = (i + 1) % segs;
      const ri = 2 + i;
      const rni = 2 + ni;

      // Ring and side edges.
      E.push([ri, rni]);
      E.push([0, ri]);
      E.push([1, ri]);

      // Side face and base face.
      F.push([0, ri, rni]);
      F.push([1, rni, ri]);
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Cone', build: buildCone });
})(window);
