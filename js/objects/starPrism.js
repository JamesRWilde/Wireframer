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

    const bottomCenter = V.length;
    V.push([0, -halfH, 0]);
    const topCenter = V.length;
    V.push([0, halfH, 0]);

    const F = [];
    for (let i = 0; i < points; i++) {
      const ni = (i + 1) % points;
      F.push([i, ni, points + ni, points + i]);
      // Triangulated caps avoid invalid fan triangulation of concave star polygons.
      F.push([bottomCenter, ni, i]);
      F.push([topCenter, points + i, points + ni]);
    }

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

    // Keep wireframe clean: perimeter + verticals only (no cap spokes to center points).
    for (let i = 0; i < points; i++) {
      const ni = (i + 1) % points;
      addEdge(i, ni);
      addEdge(points + i, points + ni);
      addEdge(i, points + i);
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Star Prism', build: buildStarPrism });
})(window);
