'use strict';

(function registerCylinder(global) {
  const { buildRevolution, detailCount } = global.WireframeGeometry;

  function buildCylinder(options = {}) {
    const detail = options.detail ?? 1;
    const segs = detailCount(64, detail, 28, 2);

    return buildRevolution([
      [0.0, -1.02],
      [0.78, -1.02],
      [0.78, 1.02],
      [0.0, 1.02],
    ], segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Cylinder', build: buildCylinder });
})(window);
