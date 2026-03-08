'use strict';

(function registerCylinder(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildCylinder(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // 4 profile points => vertices = segs * 4.
    // Target max: 232 vertices (58 segments).
    const segsMin = 8;
    const segsMax = 58;
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);

    return buildRevolution([
      [0.0, -1.02],
      [0.78, -1.02],
      [0.78, 1.02],
      [0.0, 1.02],
    ], segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Cylinder', build: buildCylinder });
})(window);
