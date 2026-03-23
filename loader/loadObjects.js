/**
 * loadObjects.js - Load Object List
 *
 * PURPOSE:
 *   Fetches and returns the list of available 3D objects.
 *
 * ARCHITECTURE ROLE:
 *   Provides object catalog data to populate UI selectors.
 *
 * WHY THIS EXISTS:
 *   Explicitly documents the loader abstraction boundaries for available meshes.
 *
 * USAGE:
 *   import { loadObjects } from '@loader/loadObjects.js';
 *   const objects = await loadObjects();
 */

"use strict";

import { objectList } from '@engine/get/render/getObjectList.js';

export async function loadObjects() {
  try {
    return await objectList();
  } catch (err) {
    console.error('[loader] Failed to load object list:', err);
    return [];
  }
}
