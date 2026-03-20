/**
 * registry.js - Object Registry for 3D Mesh Shapes
 * 
 * PURPOSE:
 *   Provides a centralized registry for 3D mesh object definitions. This is the
 *   single source of truth for all shapes available in the application. The registry
 *   enforces an engine-first architecture where only engine-defined mesh schemas
 *   are accepted - no legacy formats or alternate schemas are supported.
 * 
 * ARCHITECTURE ROLE:
 *   This file is imported by init modules to register shapes.
 *   It exposes APIs that replace global object registry globals.
 * 
 * SCHEMA CONTRACT:
 *   Each registered object must conform to: { name: string, build: function }
 *   The build function returns the engine's internal mesh format with V, F, E arrays.
 */

"use strict";

// Module-scoped registry state.
const objects = [];

/**
 * WireframeObjectRegistry - Public API for registering mesh shapes.
 */
export const WireframeObjectRegistry = {
  register(objectDef) {
    if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
      throw new Error('Invalid object definition. Expected { name: string, build: function }.');
    }
    objects.push(objectDef);
  },
};

/**
 * getRegisteredObjects - Get all registered objects.
 */
export function getRegisteredObjects() {
  return objects;
}


