'use strict';

(function registerWineGlass(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildWineGlass(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // Profile has 13 points => vertices = 13 * segs.
    // Target range around min 50, max 800.
    const segsMin = 4;
    const segsMax = 62;
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
    return buildRevolution([
      [0.00, -1.00], [0.48, -1.00], [0.48, -0.87], [0.09, -0.77],
      [0.06, -0.14], [0.06, 0.06], [0.13, 0.22], [0.29, 0.48],
      [0.44, 0.72], [0.52, 0.93], [0.47, 1.08], [0.39, 1.20], [0.37, 1.26],
    ], segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Wine Glass', build: buildWineGlass });
})(window);
