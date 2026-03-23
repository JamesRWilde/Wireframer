#!/bin/bash
set -e
cd /media/openclaw/HDD12/.openclaw/workspace-coding/repos/Wireframer

# === GET files ===
git mv engine/get/cpu/isFillWorkerAvailable.js engine/get/cpu/getIsFillWorkerAvailable.js
git mv engine/get/cpu/geometry/isConvex.js engine/get/cpu/geometry/getIsConvex.js
git mv engine/get/engine/shouldRunFrame.js engine/get/engine/getShouldRunFrame.js
git mv engine/get/mesh/isMorphing.js engine/get/mesh/getIsMorphing.js
git mv engine/get/mesh/computeBoundingBox.js engine/get/mesh/getBoundingBox.js
git mv engine/get/render/applyEulerIncrement.js engine/get/render/getEulerIncrement.js
git mv engine/get/render/background/throttleBackgroundRendering.js engine/get/render/background/getThrottledBackgroundRender.js
git mv engine/get/render/background/parseCssColor.js engine/get/render/background/getParsedCssColor.js
git mv engine/get/render/convertFlatToNested.js engine/get/render/getFlatNested.js
git mv engine/get/render/isAvailable.js engine/get/render/getIsAvailable.js
git mv engine/get/render/projectVertices.js engine/get/render/getProjectedVertices.js
git mv engine/get/render/isGpuMode.js engine/get/render/getIsGpuMode.js
git mv engine/get/gpu/convertRgbToNormalized.js engine/get/gpu/getNormalizedRgb.js
git mv engine/get/gpu/normalizeVector3.js engine/get/gpu/getNormalizedVector3.js
git mv engine/get/gpu/toRowMajorRotation.js engine/get/gpu/getRowMajorRotation.js

# === SET files - cpu ===
git mv engine/set/cpu/fill/fillTriangleOnLayer.js engine/set/cpu/setFillTriangleOnLayer.js
git mv engine/set/cpu/fill/fillTriangle.js engine/set/cpu/setFillTriangle.js
git mv engine/set/cpu/fill/sendRenderCommand.js engine/set/cpu/setSendRenderCommand.js
git mv engine/set/cpu/drawSolidFillModel.js engine/set/cpu/setDrawSolidFillModel.js
git mv engine/set/cpu/sortTrianglesByDepth.js engine/set/cpu/setSortTrianglesByDepth.js
git mv engine/set/cpu/renderTriangle.js engine/set/cpu/setRenderTriangle.js
git mv engine/set/cpu/expandGeometryPoint.js engine/set/cpu/setExpandGeometryPoint.js
git mv engine/set/cpu/renderMeshUnified.js engine/set/cpu/setRenderMeshUnified.js

# === SET files - engine ===
git mv engine/set/engine/frame/runFrame.js engine/set/engine/setRunFrame.js
git mv engine/set/engine/applyQualityChange.js engine/set/engine/setApplyQualityChange.js

# === SET files - mesh ===
git mv engine/set/mesh/applyCpuLodCap.js engine/set/mesh/setApplyCpuLodCap.js
git mv engine/set/mesh/clusterDecimate.js engine/set/mesh/setClusterDecimate.js
git mv engine/set/mesh/capModelForCpu.js engine/set/mesh/setCapModelForCpu.js
git mv engine/set/mesh/decimateToCap.js engine/set/mesh/setDecimateToCap.js

# === SET files - render ===
git mv engine/set/render/syncCanvasSize.js engine/set/render/setSyncCanvasSize.js
git mv engine/set/render/switchToCpuMode.js engine/set/render/setSwitchToCpuMode.js
git mv engine/set/render/hexToRgb.js engine/set/render/setHexToRgb.js
git mv engine/set/render/drawTrianglesCpu.js engine/set/render/setDrawTrianglesCpu.js
git mv engine/set/render/drawTrianglesGpu.js engine/set/render/setDrawTrianglesGpu.js
git mv engine/set/render/draw/ensureBucketArrays.js engine/set/render/draw/setEnsureBucketArrays.js
git mv engine/set/render/draw/renderMainThreadParticles.js engine/set/render/draw/setRenderMainThreadParticles.js
git mv engine/set/render/draw/drawWorkerParticlesCpu.js engine/set/render/draw/setDrawWorkerParticlesCpu.js
git mv engine/set/render/draw/bucketWorkerParticles.js engine/set/render/draw/setBucketWorkerParticles.js
git mv engine/set/render/draw/drawBackground.js engine/set/render/draw/setDrawBackground.js
git mv engine/set/render/draw/getCachedColorRgb.js engine/set/render/draw/setGetCachedColorRgb.js
git mv engine/set/render/draw/backgroundCpu.js engine/set/render/draw/setBackgroundCpu.js
git mv engine/set/render/draw/backgroundGpu.js engine/set/render/draw/setBackgroundGpu.js
git mv engine/set/render/draw/renderWorkerParticles.js engine/set/render/draw/setRenderWorkerParticles.js
git mv engine/set/render/draw/parseColorToRgb.js engine/set/render/draw/setParseColorToRgb.js
git mv engine/set/render/handleMove.js engine/set/render/setHandleMove.js
git mv engine/set/render/background/handleWorkerReady.js engine/set/render/background/setHandleWorkerReady.js
git mv engine/set/render/background/handleWorkerError.js engine/set/render/background/setHandleWorkerError.js
git mv engine/set/render/background/handleWorkerParticles.js engine/set/render/background/setHandleWorkerParticles.js
git mv engine/set/render/sendToWorker.js engine/set/render/setSendToWorker.js
git mv engine/set/render/toggleRenderMode.js engine/set/render/setToggleRenderMode.js
git mv engine/set/render/switchToGpuMode.js engine/set/render/setSwitchToGpuMode.js
git mv engine/set/render/physics/applyFriction.js engine/set/render/physics/setApplyFriction.js
git mv engine/set/render/physics/rebuildDerivedCache.js engine/set/render/physics/setRebuildDerivedCache.js
git mv engine/set/render/physics/easeTowardAuto.js engine/set/render/physics/setEaseTowardAuto.js
git mv engine/set/render/seedParticles.js engine/set/render/setSeedParticles.js
git mv engine/set/render/postToBackgroundWorker.js engine/set/render/setPostToBackgroundWorker.js
git mv engine/set/render/getRenderForeground.js engine/set/render/setGetRenderForeground.js

# === SET files - gpu ===
git mv engine/set/gpu/rebuildBackgroundBuffer.js engine/set/gpu/setRebuildBackgroundBuffer.js
git mv engine/set/gpu/drawGpu.js engine/set/gpu/setDrawGpu.js
git mv engine/set/gpu/drawSceneModel.js engine/set/gpu/setDrawSceneModel.js
git mv engine/set/gpu/render/getModelFn.js engine/set/gpu/render/setGetModelFn.js
git mv engine/set/gpu/render/renderBgGpu.js engine/set/gpu/render/setRenderBgGpu.js

# === ui/set ===
git mv ui/set/apply/applyThemeMode.js ui/set/apply/setApplyThemeMode.js

echo "All files renamed via git mv (except isGpuMode.js in set which needs special handling)"
