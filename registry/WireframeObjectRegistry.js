/**
 * WireframeObjectRegistry.js - Object Registry for 3D Mesh Shapes
 *
 * PURPOSE:
 *   Provides a centralized registry for 3D mesh object definitions.
 *   This is the single source of truth for all shapes available in the application.
 *
 * ARCHITECTURE ROLE:
 *   Exposes the register method to allow modules to add shape definitions.
 *
 * SCHEMA CONTRACT:
 *   Each registered object must conform to: { name: string, build: function }
 *   The build function returns the engine's internal mesh format with V, F, E arrays.
 *
 * USAGE:
 *   import { WireframeObjectRegistry } from '@registry/WireframeObjectRegistry.js';
 *   WireframeObjectRegistry.register({ name: 'Cube', build: () => ({V, F, E}) });
 */

"use strict";

// Module-scoped registry state.
const objects = [];

export const WireframeObjectRegistry = {
  register(objectDef) {
    if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
      throw new Error('Invalid object definition. Expected { name: string, build: function }.');
    }
    objects.push(objectDef);
  },
};
