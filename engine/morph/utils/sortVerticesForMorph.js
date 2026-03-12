import { compareMorphVertices } from './compareMorphVertices.js';

export function sortVerticesForMorph(vertices) {
  return vertices
    .map((v) => [v[0], v[1], v[2]])
    .sort(compareMorphVertices);
}
