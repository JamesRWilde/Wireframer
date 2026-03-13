"use strict";

import { getModelTriangles } from '../../fill/getModelTriangles.js';
import { buildEdgeToFacesMap } from './buildEdgeToFacesMap.js';
import { computeMeshCenter } from './computeMeshCenter.js';
import { computeFaceNormals } from './computeFaceNormals.js';
import { determineEdgeClassification } from './determineEdgeClassification.js';

export function classifyEdges(model, T) {
  const triFaces = getModelTriangles(model);
  if (!triFaces?.length) return new Map();

  const edgeToFaces = buildEdgeToFacesMap(triFaces);
  const meshCenter = computeMeshCenter(T);
  const faceNormals = computeFaceNormals(T, triFaces, meshCenter);

  const viewDir = [0, 0, -1];
  const classification = new Map();

  for (const [key, faceIndices] of edgeToFaces) {
    classification.set(key, determineEdgeClassification(faceNormals, viewDir, faceIndices));
  }

  return classification;
}
