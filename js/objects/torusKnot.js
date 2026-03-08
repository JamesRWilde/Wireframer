'use strict';

(function registerTorusKnot(global) {
  const { buildTube, detailCount } = global.WireframeGeometry;

  function buildTorusKnot(options = {}) {
    const detail = options.detail ?? 1;
    const R = 0.68;
    const r = 0.26;
    const p = 2;
    const q = 3;
    const segs = detailCount(180, detail, 84, 2);
    const sides = detailCount(10, detail, 6, 1);

    return buildTube((t) => {
      const phi = q * t;
      return [
        (R + r * Math.cos(phi)) * Math.cos(p * t),
        r * Math.sin(phi),
        (R + r * Math.cos(phi)) * Math.sin(p * t),
      ];
    }, segs, sides, 0.11);
  }

  global.WireframeObjectRegistry.register({ name: 'Torus Knot', build: buildTorusKnot });
})(window);
