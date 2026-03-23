#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REPO = '/media/openclaw/HDD12/.openclaw/workspace-coding/repos/Wireframer';
process.chdir(REPO);

// Only include renames where files were actually moved (excluding state objects that were reverted)
const renames = [
  // ENGINE/GET
  ['engine/get/cpu/fillCachedFrame.js', 'getCachedFrame.js', 'fillCachedFrame', 'getCachedFrame'],
  ['engine/get/cpu/geometry/convex.js', 'isConvex.js', 'convex', 'isConvex'],
  ['engine/get/cpu/geometry/signedArea.js', 'getSignedArea.js', 'signedArea', 'getSignedArea'],
  ['engine/get/cpu/geometry/sumNormals.js', 'getSummedNormals.js', 'sumNormals', 'getSummedNormals'],
  ['engine/get/cpu/geometry/flatNormals.js', 'getFlatNormals.js', 'flatNormals', 'getFlatNormals'],
  ['engine/get/cpu/geometry/pointTriangle.js', 'getPointTriangle.js', 'pointTriangle', 'getPointTriangle'],
  ['engine/get/engine/budget.js', 'getBudget.js', 'budget', 'getBudget'],
  ['engine/get/engine/foregroundRenderMode.js', 'getForegroundRenderMode.js', 'foregroundRenderMode', 'getForegroundRenderMode'],
  ['engine/get/engine/priority.js', 'getPriority.js', 'priority', 'getPriority'],
  ['engine/get/engine/determineTarget.js', 'getTarget.js', 'determineTarget', 'getTarget'],
  ['engine/get/engine/averageTime.js', 'getAverageTime.js', 'averageTime', 'getAverageTime'],
  ['engine/get/mesh/orCreateVertIdx.js', 'getOrCreateVertIdx.js', 'orCreateVertIdx', 'getOrCreateVertIdx'],
  ['engine/get/mesh/validationResult.js', 'getValidationResult.js', 'validationResult', 'getValidationResult'],
  ['engine/get/mesh/currentMorph.js', 'getCurrentMorph.js', 'currentMorph', 'getCurrentMorph'],
  ['engine/get/mesh/faceNormal.js', 'getFaceNormal.js', 'faceNormal', 'getFaceNormal'],
  ['engine/get/mesh/filterValidEdges.js', 'getFilteredValidEdges.js', 'filterValidEdges', 'getFilteredValidEdges'],
  ['engine/get/mesh/parseCheckResults.js', 'getParseCheckResults.js', 'parseCheckResults', 'getParseCheckResults'],
  ['engine/get/mesh/fixWinding.js', 'getFixedWinding.js', 'fixWinding', 'getFixedWinding'],
  ['engine/get/mesh/dot3.js', 'getDot3.js', 'dot3', 'getDot3'],
  ['engine/get/mesh/easeOut.js', 'getEaseOut.js', 'easeOut', 'getEaseOut'],
  ['engine/get/mesh/rawObjText.js', 'getRawObjText.js', 'rawObjText', 'getRawObjText'],
  ['engine/get/render/relativeLuminanceRaw.js', 'getRelativeLuminanceRaw.js', 'relativeLuminanceRaw', 'getRelativeLuminanceRaw'],
  ['engine/get/render/rotation/matrixX.js', 'getMatrixX.js', 'matrixX', 'getMatrixX'],
  ['engine/get/render/rotation/matrixY.js', 'getMatrixY.js', 'matrixY', 'getMatrixY'],
  ['engine/get/render/matrixMultiply3x3.js', 'getMatrixMultiply3x3.js', 'matrixMultiply3x3', 'getMatrixMultiply3x3'],
  ['engine/get/render/rgbaString.js', 'getRgbaString.js', 'rgbaString', 'getRgbaString'],
  ['engine/get/render/background/colors.js', 'getColors.js', 'colors', 'getColors'],
  ['engine/get/render/background/randomFloat.js', 'getRandomFloat.js', 'randomFloat', 'getRandomFloat'],
  ['engine/get/render/background/canvas.js', 'getBgCanvas.js', 'canvas', 'getBgCanvas'],
  ['engine/get/render/background/gpuBackgroundCanvas.js', 'getGpuBgCanvas.js', 'gpuBackgroundCanvas', 'getGpuBgCanvas'],
  ['engine/get/render/background/gpuBackgroundGl.js', 'getGpuBgGl.js', 'gpuBackgroundGl', 'getGpuBgGl'],
  ['engine/get/render/transformSync.js', 'getTransformSync.js', 'transformSync', 'getTransformSync'],
  ['engine/get/render/triangleNormalGpu.js', 'getTriangleNormalGpu.js', 'triangleNormalGpu', 'getTriangleNormalGpu'],
  ['engine/get/render/linear.js', 'getLinear.js', 'linear', 'getLinear'],
  ['engine/get/render/reorthogonalize.js', 'getReorthogonalized.js', 'reorthogonalize', 'getReorthogonalized'],
  ['engine/get/render/seamGpu.js', 'getSeamGpu.js', 'seamGpu', 'getSeamGpu'],
  ['engine/get/render/model/frameData.js', 'getFrameData.js', 'frameData', 'getFrameData'],
  ['engine/get/render/triangleGpu.js', 'getTriangleGpu.js', 'triangleGpu', 'getTriangleGpu'],
  ['engine/get/render/cachedTransformResult.js', 'getCachedTransformResult.js', 'cachedTransformResult', 'getCachedTransformResult'],
  ['engine/get/render/seamCpu.js', 'getSeamCpu.js', 'seamCpu', 'getSeamCpu'],
  ['engine/get/render/lerpColor.js', 'getLerpColor.js', 'lerpColor', 'getLerpColor'],
  ['engine/get/gpu/modelBuffers.js', 'getModelBuffers.js', 'modelBuffers', 'getModelBuffers'],
  ['engine/get/gpu/sceneRenderer.js', 'getSceneRendererGpu.js', 'sceneRenderer', 'getSceneRendererGpu'],
  ['engine/get/gpu/backgroundParticleBufferNeedsRebuild.js', 'getBgParticleBufferNeedsRebuild.js', 'backgroundParticleBufferNeedsRebuild', 'getBgParticleBufferNeedsRebuild'],

  // ENGINE/SET
  ['engine/set/cpu/canvasCpuHidden.js', 'setCanvasCpuHidden.js', 'canvasCpuHidden', 'setCanvasCpuHidden'],
  ['engine/set/cpu/canvasHidden.js', 'setCanvasHidden.js', 'canvasHidden', 'setCanvasHidden'],
  ['engine/set/cpu/fill/triangle.js', 'fillTriangle.js', 'triangle', 'fillTriangle'],
  ['engine/set/cpu/fill/triangleOnLayer.js', 'fillTriangleOnLayer.js', 'triangleOnLayer', 'fillTriangleOnLayer'],
  ['engine/set/cpu/geometryExpandPoint.js', 'expandGeometryPoint.js', 'geometryExpandPoint', 'expandGeometryPoint'],
  ['engine/set/engine/frame/animationFrame.js', 'setAnimationFrame.js', 'animationFrame', 'setAnimationFrame'],
  // budgetState is a state object - skipped
  ['engine/set/engine/frame/run.js', 'runFrame.js', 'run', 'runFrame'],
  ['engine/set/engine/frame/time.js', 'setFrameTime.js', 'time', 'setFrameTime'],
  ['engine/set/engine/hud.js', 'setHud.js', 'hud', 'setHud'],
  ['engine/set/engine/mixedRenderFlags.js', 'setMixedRenderFlags.js', 'mixedRenderFlags', 'setMixedRenderFlags'],
  ['engine/set/engine/physics.js', 'setPhysics.js', 'physics', 'setPhysics'],
  ['engine/set/engine/qualityApplyChange.js', 'applyQualityChange.js', 'qualityApplyChange', 'applyQualityChange'],
  ['engine/set/engine/restoredState.js', 'setRestoredState.js', 'restoredState', 'setRestoredState'],
  ['engine/set/engine/telemetry/hud.js', 'setTelemetryHud.js', 'hud', 'setTelemetryHud'],
  ['engine/set/engine/telemetry/telemetryState.js', 'setTelemetryState.js', 'telemetryState', 'setTelemetryState'],
  ['engine/set/gpu/canvasHidden.js', 'setGpuCanvasHidden.js', 'canvasHidden', 'setGpuCanvasHidden'],
  ['engine/set/gpu/draw.js', 'drawGpu.js', 'draw', 'drawGpu'],
  ['engine/set/gpu/projectionUniforms.js', 'setProjectionUniforms.js', 'projectionUniforms', 'setProjectionUniforms'],
  ['engine/set/gpu/render/background.js', 'renderBgGpu.js', 'background', 'renderBgGpu'],
  ['engine/set/gpu/render/backgroundRenderer.js', 'setBgRenderer.js', 'backgroundRenderer', 'setBgRenderer'],
  ['engine/set/gpu/render/sceneModel.js', 'setSceneModel.js', 'sceneModel', 'setSceneModel'],
  ['engine/set/gpu/sceneCanvas.js', 'setGpuSceneCanvas.js', 'sceneCanvas', 'setGpuSceneCanvas'],
  ['engine/set/mesh/detailLevel.js', 'setDetailLevel.js', 'detailLevel', 'setDetailLevel'],
  ['engine/set/mesh/lodRangeForModel.js', 'setLodRangeForModel.js', 'lodRangeForModel', 'setLodRangeForModel'],
  ['engine/set/render/cpuPath.js', 'setCpuPath.js', 'cpuPath', 'setCpuPath'],
  // gpuModeState is a state object - skipped
  ['engine/set/render/gpuPath.js', 'setGpuPath.js', 'gpuPath', 'setGpuPath'],
  ['engine/set/render/onMove.js', 'handleMove.js', 'onMove', 'handleMove'],
  // renderForegroundState is a state object - skipped
  ['engine/set/render/scene.js', 'setScene.js', 'scene', 'setScene'],
  ['engine/set/render/trianglesCpu.js', 'drawTrianglesCpu.js', 'trianglesCpu', 'drawTrianglesCpu'],
  ['engine/set/render/trianglesGpu.js', 'drawTrianglesGpu.js', 'trianglesGpu', 'drawTrianglesGpu'],
  ['engine/set/render/workerSend.js', 'sendToWorker.js', 'workerSend', 'sendToWorker'],

  // ENGINE/INIT
  ['engine/init/cpu/fillWorker.js', 'initFillWorker.js', 'fillWorker', 'initFillWorker'],
  ['engine/init/engine/rendererToggle.js', 'initRendererToggle.js', 'rendererToggle', 'initRendererToggle'],
  ['engine/init/engine/themeControls.js', 'initThemeControls.js', 'themeControls', 'initThemeControls'],
  ['engine/init/gpu/create/backgroundParticleBuffer.js', 'createBgParticleBuffer.js', 'backgroundParticleBuffer', 'createBgParticleBuffer'],
  ['engine/init/gpu/create/edgeIndexData.js', 'createEdgeIndexData.js', 'edgeIndexData', 'createEdgeIndexData'],
  ['engine/init/gpu/create/fillBuffers.js', 'createFillBuffers.js', 'fillBuffers', 'createFillBuffers'],
  ['engine/init/gpu/create/program.js', 'createProgram.js', 'program', 'createProgram'],
  ['engine/init/gpu/create/sceneBufferStore.js', 'createSceneBufferStore.js', 'sceneBufferStore', 'createSceneBufferStore'],
  ['engine/init/gpu/create/sceneDraw.js', 'createSceneDraw.js', 'sceneDraw', 'createSceneDraw'],
  ['engine/init/gpu/create/scenePrograms.js', 'createScenePrograms.js', 'scenePrograms', 'createScenePrograms'],
  ['engine/init/gpu/create/wirePosData.js', 'createWirePosData.js', 'wirePosData', 'createWirePosData'],
  ['engine/init/mesh/build/edgesFromFacesRuntime.js', 'buildEdgesFromFacesRuntime.js', 'edgesFromFacesRuntime', 'buildEdgesFromFacesRuntime'],
  ['engine/init/mesh/build/object.js', 'buildObject.js', 'object', 'buildObject'],
  // morphApi is an init script - skipped
  ['engine/init/render/backgroundWorker.js', 'initBackgroundWorker.js', 'backgroundWorker', 'initBackgroundWorker'],
  ['engine/init/render/canvas.js', 'initCanvas.js', 'canvas', 'initCanvas'],
  ['engine/init/render/workerTransform.js', 'initWorkerTransform.js', 'workerTransform', 'initWorkerTransform'],

  // UI
  ['ui/init/attach/sliderListeners.js', 'attachSliderListeners.js', 'sliderListeners', 'attachSliderListeners'],
  ['ui/init/bldMigratedState.js', 'buildMigratedState.js', 'bldMigratedState', 'buildMigratedState'],
  ['ui/init/presetSwatches.js', 'initPresetSwatches.js', 'presetSwatches', 'initPresetSwatches'],
];

// Names that are too common to globally replace in call sites
const COMMON_NAMES = new Set([
  'run', 'time', 'canvas', 'object', 'background', 'hud', 'draw', 'scene', 
  'triangle', 'colors', 'linear', 'program', 'physics', 'budget', 'priority',
  'dot3', 'convex', 'mode', 'state'
]);

function walkJsFiles(dir) {
  const results = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(full);
      } else if (entry.name.endsWith('.js')) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

console.log(`Processing import updates for ${renames.length} renames...\n`);

const jsFiles = walkJsFiles('.');
let totalPathUpdates = 0;
let totalBindingUpdates = 0;
let totalCallSiteUpdates = 0;

for (const filePath of jsFiles) {
  const relPath = path.relative('.', filePath);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileModified = false;
  
  // Skip renamed files themselves
  const isRenamedFile = renames.some(([oldRelPath, newFileName]) => {
    const dir = path.dirname(oldRelPath);
    return relPath === path.join(dir, newFileName);
  });
  if (isRenamedFile) continue;
  
  for (const [oldRelPath, newFileName, oldExport, newExport] of renames) {
    const oldBasename = path.basename(oldRelPath, '.js');
    const newBasename = path.basename(newFileName, '.js');
    const oldDir = path.dirname(oldRelPath);
    
    // Build the import path (without 'engine/' or 'ui/' prefix since @engine/ maps to repo root)
    // @engine/ maps to ./ in the repo, so @engine/get/cpu/getCachedFrame -> ./engine/get/cpu/fillCachedFrame.js
    let oldImportPath, newImportPath;
    if (oldDir.startsWith('engine/')) {
      const subPath = oldDir.substring('engine/'.length);
      oldImportPath = `@engine/${subPath}/${oldBasename}`;
      newImportPath = `@engine/${subPath}/${newBasename}`;
    } else if (oldDir.startsWith('ui/')) {
      const subPath = oldDir.substring('ui/'.length);
      oldImportPath = `@ui/${subPath}/${oldBasename}`;
      newImportPath = `@ui/${subPath}/${newBasename}`;
    } else {
      continue; // Shouldn't happen
    }
    
    // Check if this file has an import from the old path
    const hasOldImportPath = content.includes(oldImportPath);
    
    // Also check for relative imports that point to the old file
    let hasRelativeImport = false;
    const relativeImportRegex = new RegExp(`from\\s*['"]([^'"]+)['"]`, 'g');
    let relMatch;
    while ((relMatch = relativeImportRegex.exec(content)) !== null) {
      const importPath = relMatch[1];
      if (importPath.startsWith('@')) continue;
      
      const currentDir = path.dirname(filePath);
      let resolved = path.resolve(currentDir, importPath);
      if (!resolved.endsWith('.js')) resolved += '.js';
      const resolvedOld = path.resolve(oldRelPath);
      
      if (resolved === resolvedOld) {
        hasRelativeImport = true;
        break;
      }
    }
    
    if (!hasOldImportPath && !hasRelativeImport) continue;
    
    // Track if this file has our module imported (for call site updates)
    let fileHasOurModule = false;
    
    // Update import path
    if (hasOldImportPath) {
      content = content.split(oldImportPath).join(newImportPath);
      fileModified = true;
      fileHasOurModule = true;
      totalPathUpdates++;
    }
    
    if (hasRelativeImport) {
      // Update relative import path
      const currentDir = path.dirname(filePath);
      const newRelPath = path.join(path.dirname(oldRelPath), newFileName);
      const newFileAbs = path.resolve(newRelPath);
      const newRelative = path.relative(currentDir, newFileAbs);
      const prefix = newRelative.startsWith('.') ? '' : './';
      
      const oldBasenameExact = path.basename(oldRelPath);
      const escapedOld = oldBasenameExact.replace(/\./g, '\\.');
      const relImportRegex = new RegExp(`(from\\s*['"])\\.\\.?/?[^'"]*${escapedOld}(['"\\s;])`, 'g');
      const oldContent = content;
      content = content.replace(relImportRegex, `$1${prefix}${newRelative}$2`);
      if (content !== oldContent) {
        fileModified = true;
        fileHasOurModule = true;
        totalPathUpdates++;
      }
    }
    
    // Update import binding: { oldExport } -> { newExport }
    // Only update if the line imports from our module
    const lines = content.split('\n');
    let newLines = [];
    let bindingChanged = false;
    
    for (const line of lines) {
      let newLine = line;
      
      // Check if this line imports from our module
      if (line.includes('from') && (line.includes(newImportPath) || (hasRelativeImport && line.includes(path.basename(newFileName, '.js'))))) {
        // Update the binding
        const bindRegex = new RegExp(`(\\{[^}]*)\\b${oldExport}\\b([^}]*\\})`);
        if (bindRegex.test(line)) {
          newLine = line.replace(bindRegex, `$1${newExport}$2`);
          // Clean up: { , foo } -> { foo } and { foo, } -> { foo }
          newLine = newLine.replace(/\{[ ,]+/, '{ ').replace(/[ ,]+\}/, ' }');
          bindingChanged = true;
        }
      }
      
      newLines.push(newLine);
    }
    
    if (bindingChanged) {
      content = newLines.join('\n');
      fileModified = true;
      totalBindingUpdates++;
    }
    
    // Update call sites
    // Only update if this file imports from our module
    if (fileHasOurModule) {
      const isCommon = COMMON_NAMES.has(oldExport);
      
      if (!isCommon) {
        // Safe to do global replace
        const callRegex = new RegExp(`\\b${oldExport}\\s*\\(`, 'g');
        if (callRegex.test(content)) {
          content = content.replace(callRegex, `${newExport}(`);
          fileModified = true;
          totalCallSiteUpdates++;
        }
      } else {
        // For common names, only update if we updated the import binding
        if (bindingChanged) {
          const callRegex = new RegExp(`\\b${oldExport}\\s*\\(`, 'g');
          if (callRegex.test(content)) {
            content = content.replace(callRegex, `${newExport}(`);
            fileModified = true;
            totalCallSiteUpdates++;
          }
        }
      }
    }
  }
  
  if (fileModified) {
    fs.writeFileSync(filePath, content);
    console.log(`  Updated: ${relPath}`);
  }
}

console.log(`\n  Import path updates: ${totalPathUpdates}`);
console.log(`  Import binding updates: ${totalBindingUpdates}`);
console.log(`  Call site updates: ${totalCallSiteUpdates}`);
console.log(`\n=== IMPORT UPDATES COMPLETE ===`);
