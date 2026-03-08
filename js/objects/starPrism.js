'use strict';

(function registerStarPrism(global) {
  const { detailCount } = global.WireframeGeometry;

  function buildStarPrism(options = {}) {
    const detail = options.detail ?? 1;
    const points = detailCount(20, detail, 10, 2);
    const outer = 0.92;
    const inner = 0.46;
    const halfH = 0.84;

    const V = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const r = i % 2 === 0 ? outer : inner;
      V.push([r * Math.cos(a), -halfH, r * Math.sin(a)]);
    }
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const r = i % 2 === 0 ? outer : inner;
      V.push([r * Math.cos(a), halfH, r * Math.sin(a)]);
    }

    const F = [];
    const bottom = [];
    const top = [];
    for (let i = 0; i < points; i++) {
      bottom.push(i);
      top.push(points + i);
      const ni = (i + 1) % points;
      F.push([i, ni, points + ni, points + i]);
    }
    F.push(bottom);
    F.push(top.slice().reverse());

    const E = [];
    const edgeSet = new Set();
    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    for (const face of F) {
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Star Prism', build: buildStarPrism });
})(window);
