/**
 * initObjectSelector.js - Object Selector Initialization
 *
 * PURPOSE:
 *   Populates the object selection dropdown with available 3D meshes and
 *   wires up change handlers to load the selected mesh.
 *
 * ARCHITECTURE ROLE:
 *   Called during app startup to initialize the object selector UI.
 *   Handles restoring a previously selected shape and persisting selection.
 *
 * DATA FORMAT:
 *   - OBJECTS is an array of { name, obj } entries representing meshes.
 *   - The select element stores the selected index as its value.
 *
 * @param {string|null} restoredShapeName - Optional name of shape to restore
 */

"use strict";

import { getObjectList } from ''../../engine/render/get/getRenderEngineObjectList.js'';
import { setUiPersistState } from ''../set/setUiPersistState.js'';

export async function initObjectSelector(restoredShapeName = null) {
  // Fetch the dynamic list of available meshes from the server
  const OBJECTS = await getObjectList();
  
  console.debug('[initObjectSelector] called, OBJECTS length', OBJECTS.length);
  const select = document.getElementById('obj-select');
  if (!select) {
    console.debug('[initObjectSelector] select element not found');
    return;
  }
  select.innerHTML = '';
  // OBJ-only: populate selector and wire up events
  OBJECTS.forEach((obj, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = obj.name;
    select.appendChild(opt);
  });

  // Load the restored shape if provided, otherwise load the first object
  if (OBJECTS.length > 0 && typeof globalThis.loadObjMesh === 'function') {
    let loadIndex = 0;
    if (restoredShapeName) {
      const foundIndex = OBJECTS.findIndex(obj => obj.name === restoredShapeName);
      if (foundIndex >= 0) {
        loadIndex = foundIndex;
        console.debug('[initObjectSelector] restoring shape', restoredShapeName);
      } else {
        console.debug('[initObjectSelector] restored shape not found, loading first object', OBJECTS[0].name);
      }
    } else {
      console.debug('[initObjectSelector] auto-loading first object', OBJECTS[0].name);
    }
    select.selectedIndex = loadIndex;
    globalThis.loadObjMesh(OBJECTS[loadIndex].obj, OBJECTS[loadIndex].name);
  }

  select.addEventListener('change', async () => {
    const idx = Number(select.value);
    console.debug('[initObjectSelector] selection changed', idx);
    if (Number.isInteger(idx) && idx >= 0 && idx < OBJECTS.length) {
      await globalThis.loadObjMesh(OBJECTS[idx].obj, OBJECTS[idx].name);
      SetUiPersistState(OBJECTS);
    }
  });
}
