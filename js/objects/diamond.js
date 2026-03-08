'use strict';

(function registerDiamond(global) {
  function ringVertices(count, radius, y) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      out.push([radius * Math.cos(a), y, radius * Math.sin(a)]);
    }
    return out;
  }

  function buildEdgesFromFaces(faces) {
    const E = [];
    const seen = new Set();

    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (seen.has(key)) return;
      seen.add(key);
      E.push([lo, hi]);
    }

    for (const face of faces) {
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return E;
  }

  function buildDiamond(options = {}) {
    const detail = options.detail ?? 1;
    // Keep facet counts discrete so the table reads as cut geometry, not a circle.
    let sides = 10;
    if (detail <= 0.8) sides = 8;
    else if (detail >= 1.2) sides = 12;

    // Approximate round brilliant proportions (table/crown/girdle/pavilion/culet).
    const tableR = 0.52;
    const crownR = 0.88;
    const girdleR = 1.10;
    const pavilionR = 0.56;

    const yTable = 0.70;
    const yCrown = 0.46;
    const yGirdleTop = 0.12;
    const yGirdleBottom = -0.04;
    const yPavilion = -0.66;
    const yCulet = -1.16;

    const tableStart = 0;
    const crownStart = tableStart + sides;
    const girdleTopStart = crownStart + sides;
    const girdleBottomStart = girdleTopStart + sides;
    const pavilionStart = girdleBottomStart + sides;
    const culetIndex = pavilionStart + sides;

    const V = [];
    V.push(...ringVertices(sides, tableR, yTable));
    V.push(...ringVertices(sides, crownR, yCrown));
    V.push(...ringVertices(sides, girdleR, yGirdleTop));
    V.push(...ringVertices(sides, girdleR, yGirdleBottom));
    V.push(...ringVertices(sides, pavilionR, yPavilion));
    V.push([0, yCulet, 0]);

    const F = [];

    // Table as a flat top facet.
    F.push(Array.from({ length: sides }, (_, i) => tableStart + i));

    for (let i = 0; i < sides; i++) {
      const ni = (i + 1) % sides;

      const t0 = tableStart + i;
      const t1 = tableStart + ni;
      const c0 = crownStart + i;
      const c1 = crownStart + ni;
      const g0 = girdleTopStart + i;
      const g1 = girdleTopStart + ni;
      const gb0 = girdleBottomStart + i;
      const gb1 = girdleBottomStart + ni;
      const p0 = pavilionStart + i;
      const p1 = pavilionStart + ni;

      // Crown star-like facets.
      F.push([t0, c0, c1]);

      // Crown to girdle facets.
      F.push([c0, c1, g1, g0]);

      // Girdle band.
      F.push([g0, g1, gb1, gb0]);

      // Upper pavilion facets.
      F.push([gb0, gb1, p1, p0]);

      // Lower pavilion facets meeting at culet.
      F.push([culetIndex, p1, p0]);
    }

    const E = buildEdgesFromFaces(F);
    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Diamond', build: buildDiamond });
})(window);
