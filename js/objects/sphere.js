'use strict';

(function registerSphere(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildSphere() {
    const stacks = 12;
    const profile = [];

    for (let i = 0; i <= stacks; i++) {
      const phi = (i / stacks) * Math.PI;
      profile.push([0.95 * Math.sin(phi), 0.95 * Math.cos(phi)]);
    }

    return buildRevolution(profile, 24);
  }

  global.WireframeObjectRegistry.register({ name: 'Sphere', build: buildSphere });
})(window);
