/**
 * loadObjects.js - Load Object List
 *
 * PURPOSE:
 *   Fetches and returns the list of available 3D objects.
 *
 * ARCHITECTURE ROLE:
 *   Provides object catalog data to populate UI selectors.
 *
 * USAGE:
 *   import { loadObjects } from '@loader/loadObjects.js';
 *   const objects = await loadObjects();
 */

"use strict";

import { objectList } from '@engine/get/render/objectList.js';

export async function loadObjects() {
  try {
    return await objectList();
  } catch (err) {
    console.error('[loader] Failed to load object list:', err);
    return [];
  }
}
