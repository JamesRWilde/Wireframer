'use strict';

(function registerCapsule(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildCapsule(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // Direct interpolation gives full slider range from coarse to smooth.
    const segsMin = 10;
    const segsMax = 40;
    const stacksMin = 2;
    const stacksMax = 10;
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
    const capStacks = Math.max(stacksMin, Math.round(stacksMin + (stacksMax - stacksMin) * t));
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
