import { greedyClusterDecimator } from './greedyClusterDecimator.js';

export function decimateMeshByPercent(model, percent) {
    if (!model || !Array.isArray(model.V) || model.V.length < 3) return { V: model.V.slice(), F: model.F.slice() };
    const faceCount = model.F.length;
    const minFaces = 4;
    const targetFaces = Math.max(minFaces, Math.round(percent * faceCount));
    if (targetFaces >= faceCount) {
        return { V: model.V.slice(), F: model.F.slice() };
    }
    return greedyClusterDecimator(model, targetFaces);
}