/**
 * loadObjMesh.js - Fetch and Load OBJ File
 *
 * PURPOSE:
 *   Fetches an OBJ file from a URL, parses it to runtime mesh format,
 *   and loads it through the full mesh pipeline (load).
 *
 * ARCHITECTURE ROLE:
 *   Called when loading external OBJ files by path. Wraps the fetch +
 *   parse + load sequence into a single async call. Exposed globally
 *   as globalThis.loadObjMesh for flexible access.
 */

"use strict";

import { toRuntime } from '@engine/init/mesh/toRuntime.js';
import { load } from '@engine/init/mesh/load.js';
import { setLoadObjMesh } from '@engine/set/mesh/setLoadObjMesh.js';

/**
 * loadObjMesh - Fetches an OBJ file and loads it through the pipeline.
 *
 * Fetches the OBJ text, parses it via toRuntime (converting OBJ format
 * to V/F/E arrays), then runs the full load pipeline which normalises
 * to bounding sphere space and finalises the model.
 *
 * @param {string} objPath - Path to the OBJ file (URL or relative path)
 * @param {string} [name='Shape'] - Display name for the mesh
 * @returns {Promise<Object>} The processed model ready for rendering
 */
export async function loadObjMesh(objPath, name = 'Shape') {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  const mesh = toRuntime(objText, { meshFileName: objPath, meshType: 'OBJ' });
  return load(mesh, name, { animateMorph: true });
}

// Register for modular engine access (replaces globalThis.loadObjMesh)
setLoadObjMesh(loadObjMesh);

