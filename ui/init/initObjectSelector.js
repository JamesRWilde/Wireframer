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

import {objectList}from '@engine/get/render/objectList.js';
import { getLoadObjMesh } from '@engine/get/mesh/getLoadObjMesh.js';
import { state as persistState }from '@ui/set/persist/state.js';


export async function initObjectSelector(restoredShapeName = null) {
  // Fetch the dynamic list of available meshes from the server
  const OBJECTS = await objectList();
  
  const select = document.getElementById('obj-select');
  if (!select) {
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
  const loadObjMeshFn = getLoadObjMesh();
  if (OBJECTS.length > 0 && typeof loadObjMeshFn === 'function') {
    let loadIndex = 0;
    if (restoredShapeName) {
      const foundIndex = OBJECTS.findIndex(obj => obj.name === restoredShapeName);
      if (foundIndex >= 0) {
        loadIndex = foundIndex;
      } 
    } 
    select.selectedIndex = loadIndex;
    await loadObjMeshFn(OBJECTS[loadIndex].obj, OBJECTS[loadIndex].name);
  }

  select.addEventListener('change', async () => {
    const idx = Number(select.value);
    if (Number.isInteger(idx) && idx >= 0 && idx < OBJECTS.length) {
      const name = OBJECTS[idx].name;
      await loadObjMeshFn(OBJECTS[idx].obj, name);
      persistState(OBJECTS);
    }
  });
}
