#!/bin/bash
set -e
cd /media/openclaw/HDD12/.openclaw/workspace-coding/repos/Wireframer

# Use \b word boundaries for precise matching
# Process longer names first to avoid substring issues

# GET folder functions
sed -i 's/\bcomputeBoundingBox\b/getBoundingBox/g' engine/get/mesh/getBoundingBox.js
sed -i 's/\bapplyEulerIncrement\b/getEulerIncrement/g' engine/get/render/getEulerIncrement.js
sed -i 's/\bthrottleBackgroundRendering\b/getThrottledBackgroundRender/g' engine/get/render/background/getThrottledBackgroundRender.js
sed -i 's/\bconvertFlatToNested\b/getFlatNested/g' engine/get/render/getFlatNested.js
sed -i 's/\bconvertRgbToNormalized\b/getNormalizedRgb/g' engine/get/gpu/getNormalizedRgb.js
sed -i 's/\bnormalizeVector3\b/getNormalizedVector3/g' engine/get/gpu/getNormalizedVector3.js
sed -i 's/\btoRowMajorRotation\b/getRowMajorRotation/g' engine/get/gpu/getRowMajorRotation.js
sed -i 's/\bisFillWorkerAvailable\b/getIsFillWorkerAvailable/g' engine/get/cpu/getIsFillWorkerAvailable.js
sed -i 's/\bisConvex\b/getIsConvex/g' engine/get/cpu/geometry/getIsConvex.js
sed -i 's/\bshouldRunFrame\b/getShouldRunFrame/g' engine/get/engine/getShouldRunFrame.js
sed -i 's/\bisMorphing\b/getIsMorphing/g' engine/get/mesh/getIsMorphing.js
sed -i 's/\bparseCssColor\b/getParsedCssColor/g' engine/get/render/background/getParsedCssColor.js
sed -i 's/\bisAvailable\b/getIsAvailable/g' engine/get/render/getIsAvailable.js
sed -i 's/\bprojectVertices\b/getProjectedVertices/g' engine/get/render/getProjectedVertices.js
# isGpuMode in get folder is already renamed and updated

# SET folder functions - cpu
sed -i 's/\bfillTriangleOnLayer\b/setFillTriangleOnLayer/g' engine/set/cpu/setFillTriangleOnLayer.js
sed -i 's/\bfillTriangle\b/setFillTriangle/g' engine/set/cpu/setFillTriangle.js
sed -i 's/\bsendRenderCommand\b/setSendRenderCommand/g' engine/set/cpu/setSendRenderCommand.js
sed -i 's/\bdrawSolidFillModel\b/setDrawSolidFillModel/g' engine/set/cpu/setDrawSolidFillModel.js
sed -i 's/\bsortTrianglesByDepth\b/setSortTrianglesByDepth/g' engine/set/cpu/setSortTrianglesByDepth.js
sed -i 's/\brenderTriangle\b/setRenderTriangle/g' engine/set/cpu/setRenderTriangle.js
sed -i 's/\bexpandGeometryPoint\b/setExpandGeometryPoint/g' engine/set/cpu/setExpandGeometryPoint.js
sed -i 's/\brenderMeshUnified\b/setRenderMeshUnified/g' engine/set/cpu/setRenderMeshUnified.js

# SET folder functions - engine
sed -i 's/\brunFrame\b/setRunFrame/g' engine/set/engine/setRunFrame.js
sed -i 's/\bapplyQualityChange\b/setApplyQualityChange/g' engine/set/engine/setApplyQualityChange.js

# SET folder functions - mesh
sed -i 's/\bapplyCpuLodCap\b/setApplyCpuLodCap/g' engine/set/mesh/setApplyCpuLodCap.js
sed -i 's/\bclusterDecimate\b/setClusterDecimate/g' engine/set/mesh/setClusterDecimate.js
sed -i 's/\bcapModelForCpu\b/setCapModelForCpu/g' engine/set/mesh/setCapModelForCpu.js
sed -i 's/\bdecimateToCap\b/setDecimateToCap/g' engine/set/mesh/setDecimateToCap.js

# SET folder functions - render
sed -i 's/\bsyncCanvasSize\b/setSyncCanvasSize/g' engine/set/render/setSyncCanvasSize.js
sed -i 's/\bswitchToCpuMode\b/setSwitchToCpuMode/g' engine/set/render/setSwitchToCpuMode.js
sed -i 's/\bhexToRgb\b/setHexToRgb/g' engine/set/render/setHexToRgb.js
sed -i 's/\bdrawTrianglesCpu\b/setDrawTrianglesCpu/g' engine/set/render/setDrawTrianglesCpu.js
sed -i 's/\bdrawTrianglesGpu\b/setDrawTrianglesGpu/g' engine/set/render/setDrawTrianglesGpu.js
sed -i 's/\bensureBucketArrays\b/setEnsureBucketArrays/g' engine/set/render/draw/setEnsureBucketArrays.js
sed -i 's/\brenderMainThreadParticles\b/setRenderMainThreadParticles/g' engine/set/render/draw/setRenderMainThreadParticles.js
sed -i 's/\bdrawWorkerParticlesCpu\b/setDrawWorkerParticlesCpu/g' engine/set/render/draw/setDrawWorkerParticlesCpu.js
sed -i 's/\bbucketWorkerParticles\b/setBucketWorkerParticles/g' engine/set/render/draw/setBucketWorkerParticles.js
sed -i 's/\bdrawBackground\b/setDrawBackground/g' engine/set/render/draw/setDrawBackground.js
sed -i 's/\bgetCachedColorRgb\b/setGetCachedColorRgb/g' engine/set/render/draw/setGetCachedColorRgb.js
sed -i 's/\bbackgroundCpu\b/setBackgroundCpu/g' engine/set/render/draw/setBackgroundCpu.js
sed -i 's/\bbackgroundGpu\b/setBackgroundGpu/g' engine/set/render/draw/setBackgroundGpu.js
sed -i 's/\brenderWorkerParticles\b/setRenderWorkerParticles/g' engine/set/render/draw/setRenderWorkerParticles.js
sed -i 's/\bparseColorToRgb\b/setParseColorToRgb/g' engine/set/render/draw/setParseColorToRgb.js
sed -i 's/\bhandleMove\b/setHandleMove/g' engine/set/render/setHandleMove.js
sed -i 's/\bhandleWorkerReady\b/setHandleWorkerReady/g' engine/set/render/background/setHandleWorkerReady.js
sed -i 's/\bhandleWorkerError\b/setHandleWorkerError/g' engine/set/render/background/setHandleWorkerError.js
sed -i 's/\bhandleWorkerParticles\b/setHandleWorkerParticles/g' engine/set/render/background/setHandleWorkerParticles.js
sed -i 's/\bsendToWorker\b/setSendToWorker/g' engine/set/render/setSendToWorker.js
sed -i 's/\btoggleRenderMode\b/setToggleRenderMode/g' engine/set/render/setToggleRenderMode.js
sed -i 's/\bswitchToGpuMode\b/setSwitchToGpuMode/g' engine/set/render/setSwitchToGpuMode.js
sed -i 's/\bapplyFriction\b/setApplyFriction/g' engine/set/render/physics/setApplyFriction.js
sed -i 's/\brebuildDerivedCache\b/setRebuildDerivedCache/g' engine/set/render/physics/setRebuildDerivedCache.js
sed -i 's/\beaseTowardAuto\b/setEaseTowardAuto/g' engine/set/render/physics/setEaseTowardAuto.js
sed -i 's/\bseedParticles\b/setSeedParticles/g' engine/set/render/setSeedParticles.js
sed -i 's/\bpostToBackgroundWorker\b/setPostToBackgroundWorker/g' engine/set/render/setPostToBackgroundWorker.js
sed -i 's/\bgetRenderForeground\b/setGetRenderForeground/g' engine/set/render/setGetRenderForeground.js

# SET folder functions - gpu
sed -i 's/\brebuildBackgroundBuffer\b/setRebuildBackgroundBuffer/g' engine/set/gpu/setRebuildBackgroundBuffer.js
sed -i 's/\bdrawGpu\b/setDrawGpu/g' engine/set/gpu/setDrawGpu.js
sed -i 's/\bdrawSceneModel\b/setDrawSceneModel/g' engine/set/gpu/setDrawSceneModel.js
sed -i 's/\bgetModelFn\b/setGetModelFn/g' engine/set/gpu/render/setGetModelFn.js
sed -i 's/\brenderBgGpu\b/setRenderBgGpu/g' engine/set/gpu/render/setRenderBgGpu.js

# ui/set
sed -i 's/\bapplyThemeMode\b/setApplyThemeMode/g' ui/set/apply/setApplyThemeMode.js

echo "All function names renamed in their own files"
