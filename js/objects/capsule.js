'use strict';

(function registerCapsule(global) {
  const { buildRevolution, detailCount } = global.WireframeGeometry;

  function buildCapsule(options = {}) {
    const detail = options.detail ?? 1;
    const segs = detailCount(68, detail, 30, 2);
    const capStacks = detailCount(14, detail, 8, 1);
    const profile = [];

    const bodyHalf = 0.64;
    const radius = 0.48;

    // Bottom pole.
    profile.push([0, -bodyHalf - radius]);

    // Bottom hemisphere up to the start of the cylindrical body.
    for (let i = 1; i <= capStacks; i++) {
      const phi = (i / capStacks) * (Math.PI * 0.5);
      const x = radius * Math.sin(phi);
      const y = -bodyHalf - radius * Math.cos(phi);
      profile.push([x, y]);
    }

    // Cylindrical body segment.
    profile.push([radius, bodyHalf]);

    // Top hemisphere up to the top pole.
    for (let i = 1; i <= capStacks; i++) {
      const phi = (i / capStacks) * (Math.PI * 0.5);
      const x = radius * Math.cos(phi);
      const y = bodyHalf + radius * Math.sin(phi);
      profile.push([x, y]);
    }

    return buildRevolution(profile, segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Capsule', build: buildCapsule });
})(window);
