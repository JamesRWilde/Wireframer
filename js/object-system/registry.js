'use strict';

(function initObjectRegistry(global) {
  const objects = [];

  global.WireframeObjectRegistry = {
    register(objectDef) {
      if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
        throw new Error('Invalid object definition. Expected { name: string, build: function }.');
      }
      objects.push(objectDef);
    },
  };

  // Backward-compatible global consumed by app scripts.
  global.OBJECTS = objects;
})(window);
