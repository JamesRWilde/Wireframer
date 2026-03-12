'use strict';

(function initObjectRegistry(global) {
  // Engine-first, single-schema registry: only accepts engine-defined mesh schema.
  // All shape definitions must conform to the engine's required format: { V: [...], F: [...], ... }
  const objects = [];

  global.WireframeObjectRegistry = {
    register(objectDef) {
      if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
        throw new Error('Invalid object definition. Expected { name: string, build: function }.');
      }
      // No normalization, no legacy, no alternate schema. Engine dictates the format.
      objects.push(objectDef);
    },
  };

  // Global consumed by app scripts. Only engine-defined schema allowed.
  global.OBJECTS = objects;
})(window);
