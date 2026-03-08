'use strict';

(function registerCinquefoilKnot(global) {
  const { buildTube } = global.WireframeGeometry;

  function buildCinquefoilKnot(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;
    const p = 2;
    const q = 5;
    const R = 0.66;
    const r = 0.22;

    const segsMin = 36;
    const segsMax = 220;
    const sidesMin = 3;
    const sidesMax = 12;
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const sidesRaw = sidesMin + (sidesMax - sidesMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
    const sides = Math.max(sidesMin, Math.round(sidesRaw));

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
