export function determineEdgeClassification(faceNormals, viewDir, faceIndices) {
  let frontCount = 0;
  let backCount = 0;

  for (const fi of faceIndices) {
    const n = faceNormals[fi];
    if (!n) continue;

    const dot = n[0] * viewDir[0] + n[1] * viewDir[1] + n[2] * viewDir[2];
    if (dot < -0.01) frontCount++;
    else if (dot > 0.01) backCount++;
  }

  if (frontCount > 0 && backCount > 0) return 'silhouette';
  if (frontCount > 0) return 'front';
  if (backCount > 0) return 'back';
  return 'front';
}
