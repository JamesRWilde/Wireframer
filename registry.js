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
 *   This file is loaded early in the application lifecycle (before engine modules)
 *   to ensure the registry is available when mesh loaders attempt to register shapes.
 *   It creates a global WireframeObjectRegistry that mesh providers use to register
 *   their definitions, and exposes a global OBJECTS array consumed by the UI layer.
 * 
 * SCHEMA CONTRACT:
 *   Each registered object must conform to: { name: string, build: function }
 *   The build function returns the engine's internal mesh format with V, F, E arrays.
 */

'use strict';

/**
 * Initializes the object registry as an IIFE to avoid polluting global scope.
 * 
 * @param {Window} global - The window object passed explicitly for clarity and testability
 */
(function initObjectRegistry(global) {
  // Private array to store registered objects - not directly accessible from outside
  // This encapsulation ensures all registration goes through the validated API
  const objects = [];

  /**
   * WireframeObjectRegistry - Public API for registering mesh shapes
   * 
   * This is the only entry point for adding new shapes to the application.
   * It enforces strict validation to ensure all registered objects conform
   * to the engine's expected schema.
   */
  global.WireframeObjectRegistry = {
    /**
     * register - Adds a new mesh object definition to the registry
     * 
     * @param {Object} objectDef - The mesh object definition to register
     * @param {string} objectDef.name - Display name for the shape (shown in UI selector)
     * @param {Function} objectDef.build - Factory function that returns engine-format mesh
     * @throws {Error} If objectDef is missing, or name/build are invalid types
     * 
     * The build function should return an object with the engine's internal format:
     *   { V: [[x,y,z],...], F: [[i,j,k,...],...], E: [[i,j],...] }
     */
    register(objectDef) {
      // Validate the object definition has required properties with correct types
      // We check for null/undefined first, then validate each required field
      if (!objectDef || typeof objectDef.name !== 'string' || typeof objectDef.build !== 'function') {
        throw new Error('Invalid object definition. Expected { name: string, build: function }.');
      }
      // No normalization, no legacy support, no alternate schema negotiation.
      // The engine is the sole authority for mesh format - this strictness prevents
      // subtle bugs from format mismatches and keeps the codebase maintainable.
      objects.push(objectDef);
    },
  };

  // Expose the objects array globally so the UI layer can populate shape selectors
  // and the engine can iterate available shapes. This is read-only by convention -
  // mutation should only happen through WireframeObjectRegistry.register()
  global.OBJECTS = objects;
})(window);
