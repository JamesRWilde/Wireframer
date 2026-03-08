'use strict';

(function registerTorusKnot(global) {
  const { buildTube } = global.WireframeGeometry;

  function buildTorusKnot() {
    const R = 0.68;
    const r = 0.26;
    const p = 2;
    const q = 3;

    return buildTube((t) => {
      const phi = q * t;
      return [
        (R + r * Math.cos(phi)) * Math.cos(p * t),
        r * Math.sin(phi),
        (R + r * Math.cos(phi)) * Math.sin(p * t),
      ];
    }, 80, 5, 0.11);
  }

  global.WireframeObjectRegistry.register({ name: 'Torus Knot', build: buildTorusKnot });
})(window);
