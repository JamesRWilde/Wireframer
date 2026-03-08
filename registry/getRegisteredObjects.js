/**
 * getRegisteredObjects.js - Get All Registered Objects
 *
 * PURPOSE:
 *   Returns the list of all registered 3D mesh object definitions.
 *
 * ARCHITECTURE ROLE:
 *   Query function to retrieve the object catalog.
 *
 * USAGE:
 *   import { getRegisteredObjects } from '@registry/getRegisteredObjects.js';
 *   const objects = getRegisteredObjects();
 */

"use strict";

const objects = [];

export function getRegisteredObjects() {
  return objects;
}
