import { greedyClusterDecimator } from './greedyClusterDecimator.js';

export function decimateMeshByPercent(model, percent) {
    if (!model || !Array.isArray(model.V) || model.V.length < 3) return model;
    const faceCount = model.F.length;
    const minFaces = 4;
    const targetFaces = Math.max(minFaces, Math.round(percent * faceCount));
    if (targetFaces >= faceCount) {
        // At 100%, return the original model directly - no copy needed
        return model;
    }
    return greedyClusterDecimator(model, targetFaces);
}