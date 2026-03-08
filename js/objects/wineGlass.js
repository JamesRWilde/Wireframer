'use strict';

(function registerWineGlass(global) {
  const { buildRevolution, detailCount } = global.WireframeGeometry;

  function buildWineGlass(options = {}) {
    const detail = options.detail ?? 1;
    const segs = detailCount(56, detail, 28, 2);
    return buildRevolution([
      [0.00, -1.00], [0.48, -1.00], [0.48, -0.87], [0.09, -0.77],
      [0.06, -0.14], [0.06, 0.06], [0.13, 0.22], [0.29, 0.48],
      [0.44, 0.72], [0.52, 0.93], [0.47, 1.08], [0.39, 1.20], [0.37, 1.26],
    ], segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Wine Glass', build: buildWineGlass });
})(window);
