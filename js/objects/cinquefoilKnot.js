'use strict';

(function registerCinquefoilKnot(global) {
  const { buildTube, detailCount } = global.WireframeGeometry;

  function buildCinquefoilKnot(options = {}) {
    const detail = options.detail ?? 1;
    const p = 2;
    const q = 5;
    const R = 0.66;
    const r = 0.22;
    const segs = detailCount(220, detail, 100, 2);
    const sides = detailCount(12, detail, 6, 1);

    return buildTube((t) => {
      const phi = q * t;
      return [
        (R + r * Math.cos(phi)) * Math.cos(p * t),
        r * Math.sin(phi) * 1.05,
        (R + r * Math.cos(phi)) * Math.sin(p * t),
      ];
    }, segs, sides, 0.09);
  }

  global.WireframeObjectRegistry.register({ name: 'Cinquefoil Knot', build: buildCinquefoilKnot });
})(window);
