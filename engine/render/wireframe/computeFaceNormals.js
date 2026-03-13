import { computeFaceNormalViewSpace } from './computeFaceNormalViewSpace.js';

export function computeFaceNormals(T, triFaces, meshCenter) {
  return triFaces.map((tri) =>
    computeFaceNormalViewSpace(
      T,
      tri[0],
      tri[1],
      tri[2],
      meshCenter[0],
      meshCenter[1],
      meshCenter[2],
    ),
  );
}
