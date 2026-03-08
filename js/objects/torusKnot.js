'use strict';

(function registerTorusKnot(global) {
  const { buildTube } = global.WireframeGeometry;

  function buildTorusKnot(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;
    const R = 0.68;
    const r = 0.26;
    const p = 2;
    const q = 3;

    // Vertices = segs * sides.
    // Target range about min 100, max 2000.
    const segsMin = 20;
    const segsMax = 250;
    const sidesMin = 5;
    const sidesMax = 8;
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const sidesRaw = sidesMin + (sidesMax - sidesMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
    const sides = Math.max(sidesMin, Math.round(sidesRaw));

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
