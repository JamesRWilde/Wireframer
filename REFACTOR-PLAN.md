# Wireframer Refactoring Plan

**Date:** 2026-03-21  
**Scope:** 315 engine files + 40 UI files = 355 total JS files  

---

## Analysis Summary

### 1. Multi-function files (6 files need splitting → ~22 files after)

| File | Functions (exported) | Private helpers |
|------|---------------------|-----------------|
| `engine/set/mesh/cpuDetailCap.js` | `capModelForCpu` | `decimateToCap`, `clusterDecimate` |
| `engine/set/render/draw/renderWorkerParticles.js` | `renderWorkerParticles` | `bucketWorkerParticles`, `drawWorkerParticlesCpu` |
| `engine/init/render/backgroundWorker.js` | `backgroundWorker` | `handleWorkerReady`, `handleWorkerParticles`, `handleWorkerError` (inline closures) |
| `engine/set/render/draw/backgroundGpu.js` | `backgroundGpu` | `getGpuBackgroundCanvas`, `getGpuBackgroundGl`, `parseCssColor` |
| `engine/init/gpu/background/renderer.js` | `createBackgroundRenderer` | `randomFloat`, `parseCssColor`, `createParticleBufferData` |
| `engine/init/mesh/load.js` | `load` | `computeBoundingBox`, `computeSphereCenter`, `computeMaxRadius`, `transformToUnitSphere`, `clampToUnitSphere`, `normalizeToBoundingSphere` |

### 2. Folder pattern (get/set/init/dispose/state)
✅ **All 315 engine files are already inside the correct folder pattern.** No files exist outside `get/`, `set/`, `init/`, `dispose/`, or `state/`.

### 3. File-name vs function-name mismatches (44 files)

**Getters (20 files)** — file name doesn't match exported function name:

| Current file | Current func | Action |
|-------------|-------------|--------|
| `get/render/bgColor.js` | `getBgColor` | rename file → `getBgColor.js` |
| `get/render/bgRgb.js` | `getBgRgb` | rename file → `getBgRgb.js` |
| `get/render/edgeColor.js` | `getEdgeColor` | rename file → `getEdgeColor.js` |
| `get/render/fillOpacity.js` | `getFillOpacity` | rename file → `getFillOpacity.js` |
| `get/render/fillRgb.js` | `getFillRgb` | rename file → `getFillRgb.js` |
| `get/render/height.js` | `getH` | rename file → `getH.js` |
| `get/render/modelCy.js` | `getModelCy` | rename file → `getModelCy.js` |
| `get/render/particleColor.js` | `getParticleColor` | rename file → `getParticleColor.js` |
| `get/render/shadeBrightRgb.js` | `getShadeBrightRgb` | rename file → `getShadeBrightRgb.js` |
| `get/render/shadeDarkRgb.js` | `getShadeDarkRgb` | rename file → `getShadeDarkRgb.js` |
| `get/render/theme.js` | `getTheme` | rename file → `getTheme.js` |
| `get/render/themeMode.js` | `getThemeMode` | rename file → `getThemeMode.js` |
| `get/render/wireOpacity.js` | `getWireOpacity` | rename file → `getWireOpacity.js` |
| `get/render/zHalf.js` | `getZHalf` | rename file → `getZHalf.js` |
| `get/render/zoom.js` | `getZoom` | rename file → `getZoom.js` |
| `get/render/zoomMax.js` | `getZoomMax` | rename file → `getZoomMax.js` |
| `get/render/zoomMin.js` | `getZoomMin` | rename file → `getZoomMin.js` |
| `get/mesh/getClone.js` | `getMeshClone` | rename file → `getMeshClone.js` |
| `get/mesh/getEdgesFromFacesRuntime.js` | `getMeshEdgesFromFacesRuntime` | rename file → `getMeshEdgesFromFacesRuntime.js` |
| `get/mesh/getMorph.js` | `getMorph` | ✅ already matches (func name extracted incorrectly) |

**Setters (18 files):**

| Current file | Current func | Action |
|-------------|-------------|--------|
| `set/render/width.js` | `setW` | rename file → `setW.js` |
| `set/render/height.js` | `setH` | rename file → `setH.js` |
| `set/render/zHalf.js` | `setZHalf` | rename file → `setZHalf.js` |
| `set/render/zoom.js` | `setZoom` | rename file → `setZoom.js` |
| `set/render/zoomMax.js` | `setZoomMax` | rename file → `setZoomMax.js` |
| `set/render/zoomMin.js` | `setZoomMin` | rename file → `setZoomMin.js` |
| `set/render/modelCy.js` | `setModelCy` | rename file → `setModelCy.js` |
| `set/render/toggle.js` | `toggleRenderMode` | rename file → `toggleRenderMode.js` |
| `set/render/gpuPath.js` | `hexToRgb` | rename file → `hexToRgb.js` |
| `set/render/draw/backgroundGpu.js` | `getGpuBackgroundCanvas` (internal) | fix: export name should match |
| `set/render/draw/renderWorkerParticles.js` | `bucketWorkerParticles` (internal) | fix: export name should match |
| `set/mesh/setClone.js` | `setMeshClone` | rename file → `setMeshClone.js` |
| `set/mesh/setEdgesFromFacesRuntime.js` | `setMeshEdgesFromFacesRuntime` | rename file → `setMeshEdgesFromFacesRuntime.js` |
| `set/mesh/cpuDetailCap.js` | `capModelForCpu` | rename file → `capModelForCpu.js` |
| `set/render/physics/model.js` | `setActiveModel` | rename file → `setActiveModel.js` |
| `set/render/setRenderForeground.js` | (check func name) | verify |
| `set/render/getRenderForeground.js` | (check func name) | verify |
| `set/render/renderForegroundState.js` | (check func name) | verify |

**Init files (6 files):**

| Current file | Current func | Action |
|-------------|-------------|--------|
| `init/mesh/startMorph.js` | `recenterToOrigin` | rename file → `recenterToOrigin.js` |
| `init/mesh/load.js` | `load` | ✅ matches (private functions are the issue) |
| `init/mesh/advanceMorphFrame.js` | `interpolateInSphere` | rename file → `interpolateInSphere.js` |
| `init/render/pipeline/init.js` | `initRenderPipeline` | rename file → `initRenderPipeline.js` |
| `init/render/pipeline/cpu.js` | `initializeCpuPipeline` | rename file → `initializeCpuPipeline.js` |
| `init/mesh/clone.js` | `clone` | ✅ matches |

**UI files (2 files):**

| Current file | Current func | Action |
|-------------|-------------|--------|
| `ui/init/objectSelector.js` | `initObjectSelector` | rename file → `initObjectSelector.js` |
| `ui/set/customRgbState.js` | `setCustomRgbState` | rename file → `setCustomRgbState.js` |
| `ui/get/customRgbState.js` | `getCustomRgbState` | rename file → `getCustomRgbState.js` |

### 4. JSDoc coverage
- **Total files:** 355
- **With JSDoc:** 273 (77%)
- **Missing JSDoc:** 82 (23%)
  - 42 in `engine/get/` (mostly render getters and physics getters)
  - 27 in `engine/set/` (mostly render physics setters and render state setters)
  - 2 in `engine/state/`
  - 1 in `engine/get/gpu/`

### 5. Naming convention
**Mixed `get*` prefix and bare-noun style in getters.** Industry standard is `get*` prefix for accessor functions.

Current state in `engine/get/`:
- 20 files use `get*` function names but have non-`get*` file names
- ~61 files already match (either both `get*` or both bare)
- The convention should be: **file name = function name** with `get*` prefix for getters, `set*` for setters

### 6. Barrels, wrappers, re-exports
✅ **None found.** No barrel files, no `export { }` re-export patterns, no wrapper files. Clean.

### 7. Import paths
✅ **Nearly universal alias paths.** Only 1 relative import exists:
- `engine/get/render/relativeLuminanceRaw.js` imports `./linear.js`

---

## Phased Action Plan

### PHASE 1: Split multi-function files (6 → ~22 files)
**Risk:** Medium | **Files touched:** ~30 (6 source + ~24 importers)  
**Commit milestone:** After each file split, verify + commit

#### 1a. `engine/init/mesh/load.js` — remove 6 duplicate private functions
**All 6 private functions already exist as separate exported files:**
- `computeBoundingBox` — duplicate in `load.js`, real file at `engine/init/mesh/computeBoundingBox.js`
- `computeSphereCenter` — duplicate in `load.js`, real file at `engine/init/mesh/computeSphereCenter.js`
- `computeMaxRadius` — duplicate in `load.js`, real file at `engine/init/mesh/computeMaxRadius.js`
- `transformToUnitSphere` — duplicate in `load.js`, real file at `engine/init/mesh/transformToUnitSphere.js`
- `clampToUnitSphere` — duplicate in `load.js`, real file at `engine/init/mesh/clampToUnitSphere.js`
- `normalizeToBoundingSphere` — duplicate in `load.js`, real file at `engine/init/mesh/normalizeToBoundingSphere.js`

**Action:** Remove the 6 duplicate function bodies from `load.js` and add imports from the existing separate files instead. The implementations are nearly identical (separate files have `export`, load.js versions are private).

#### 1b. `engine/init/gpu/background/renderer.js` → 4 files
- Move `randomFloat` → `engine/get/render/background/randomFloat.js`
- Move `parseCssColor` → `engine/get/render/parseCssColor.js`
- Move `createParticleBufferData` → `engine/init/gpu/background/createParticleBufferData.js`
- Keep `createBackgroundRenderer` in `engine/init/gpu/background/renderer.js`

#### 1c. `engine/set/render/draw/backgroundGpu.js` → 4 files
- Move `getGpuBackgroundCanvas` → `engine/get/render/background/gpuCanvas.js`
- Move `getGpuBackgroundGl` → `engine/get/render/background/gpuGl.js`
- Move `parseCssColor` → `engine/get/render/parseCssColor.js` (reuse from 1b)
- Keep `backgroundGpu` in `engine/set/render/draw/backgroundGpu.js`

#### 1d. `engine/set/mesh/cpuDetailCap.js` → 3 files
- Move `decimateToCap` → `engine/set/mesh/decimateToCap.js`
- Move `clusterDecimate` → `engine/set/mesh/clusterDecimate.js`
- Keep `capModelForCpu` in `engine/set/mesh/cpuDetailCap.js` (later renamed to `capModelForCpu.js`)

#### 1e. `engine/set/render/draw/renderWorkerParticles.js` → 3 files
- Move `bucketWorkerParticles` → `engine/set/render/draw/bucketWorkerParticles.js`
- Move `drawWorkerParticlesCpu` → `engine/set/render/draw/drawWorkerParticlesCpu.js`
- Keep `renderWorkerParticles` in `engine/set/render/draw/renderWorkerParticles.js`

#### 1f. `engine/init/render/backgroundWorker.js`
- `handleWorkerReady`, `handleWorkerParticles`, `handleWorkerError` are **closure functions** defined inside `backgroundWorker`. These should remain as closures or be moved to module-level private functions. Since they access `state` via closure, keep them as internal helpers in the same file. ✅ **No split needed** for these.

**Sub-phases with commits:**
- 1a + 1b → commit "Phase 1a-b: Split load.js and renderer.js into single-function files"
- 1c + 1d → commit "Phase 1c-d: Split backgroundGpu.js and cpuDetailCap.js into single-function files"
- 1e → commit "Phase 1e: Split renderWorkerParticles.js into single-function files"
- Verify all imports updated → commit "Phase 1: Verify all imports after multi-function splits"

---

### PHASE 2: Rename functions to match file names (or files to match functions)
**Risk:** Medium-High | **Files touched:** ~65 (44 renames + ~21 importers per rename)  
**Commit milestone:** After each sub-group, verify + commit

**Strategy:** For `get/` and `set/` folders, the `get*`/`set*` prefix is the correct convention. Rename **files** to match function names (not the reverse), since the function names are more descriptive and follow the `get*`/`set*` accessor pattern.

#### 2a. Getter file renames (18 files)
Rename files to match their exported function names:
```
engine/get/render/bgColor.js → getBgColor.js
engine/get/render/bgRgb.js → getBgRgb.js
engine/get/render/edgeColor.js → getEdgeColor.js
engine/get/render/fillOpacity.js → getFillOpacity.js
engine/get/render/fillRgb.js → getFillRgb.js
engine/get/render/height.js → getH.js
engine/get/render/modelCy.js → getModelCy.js
engine/get/render/particleColor.js → getParticleColor.js
engine/get/render/shadeBrightRgb.js → getShadeBrightRgb.js
engine/get/render/shadeDarkRgb.js → getShadeDarkRgb.js
engine/get/render/theme.js → getTheme.js
engine/get/render/themeMode.js → getThemeMode.js
engine/get/render/wireOpacity.js → getWireOpacity.js
engine/get/render/zHalf.js → getZHalf.js
engine/get/render/zoom.js → getZoom.js
engine/get/render/zoomMax.js → getZoomMax.js
engine/get/render/zoomMin.js → getZoomMin.js
engine/get/mesh/getClone.js → getMeshClone.js
```
- Update all imports referencing old paths → commit "Phase 2a: Rename getter files to match function names"

#### 2b. Setter file renames (15 files)
```
engine/set/render/width.js → setW.js
engine/set/render/height.js → setH.js
engine/set/render/zHalf.js → setZHalf.js
engine/set/render/zoom.js → setZoom.js
engine/set/render/zoomMax.js → setZoomMax.js
engine/set/render/zoomMin.js → setZoomMin.js
engine/set/render/modelCy.js → setModelCy.js
engine/set/render/toggle.js → toggleRenderMode.js
engine/set/render/gpuPath.js → hexToRgb.js
engine/set/mesh/setClone.js → setMeshClone.js
engine/set/mesh/setEdgesFromFacesRuntime.js → setMeshEdgesFromFacesRuntime.js
engine/set/mesh/cpuDetailCap.js → capModelForCpu.js
engine/set/render/physics/model.js → setActiveModel.js
```
- Update all imports → commit "Phase 2b: Rename setter files to match function names"

#### 2c. Init/other file renames (5 files)
```
engine/init/mesh/startMorph.js → recenterToOrigin.js
engine/init/mesh/advanceMorphFrame.js → interpolateInSphere.js
engine/init/render/pipeline/init.js → initRenderPipeline.js
engine/init/render/pipeline/cpu.js → initializeCpuPipeline.js
ui/init/objectSelector.js → initObjectSelector.js
ui/set/customRgbState.js → setCustomRgbState.js
ui/get/customRgbState.js → getCustomRgbState.js
```
- Update all imports → commit "Phase 2c: Rename init/UI files to match function names"

#### 2d. Fix edge cases (files where internal function name leaked as export)
```
engine/get/mesh/getEdgesFromFacesRuntime.js → getMeshEdgesFromFacesRuntime.js
engine/set/render/draw/backgroundGpu.js → (verify export name)
engine/set/render/draw/renderWorkerParticles.js → (verify export name)
engine/set/render/setRenderForeground.js → (verify export name)
engine/set/render/getRenderForeground.js → (verify export name)
engine/set/render/renderForegroundState.js → (verify export name)
```
- commit "Phase 2d: Fix remaining naming edge cases"

---

### PHASE 3: Add JSDoc to 82 files
**Risk:** Low | **Files touched:** 82  
**Commit milestone:** After each sub-group

#### 3a. `engine/get/render/` getters (34 files)
All the physics getters (`getAutoWx`, `getRotation`, etc.) and render getters (`getBgColor`, `getZoom`, etc.) need JSDoc blocks.

#### 3b. `engine/set/render/` setters (27 files)
All the physics setters and render state setters need JSDoc blocks.

#### 3c. `engine/get/` remaining (8 files)
`getGpuGl.js`, `getMeshClone.js`, `getInitMeshEngineLoad.js`, `getLoadObjMesh.js`, `getLodRange.js`, `getMeshParseErrors.js`, `throttleBackgroundRendering.js`

#### 3d. `engine/state/` (2 files)
`lodRangeState.js`, `renderState.js`

- commit after each sub-group

---

### PHASE 4: Fix single relative import
**Risk:** Trivial | **Files touched:** 1

```
engine/get/render/relativeLuminanceRaw.js:
  import { linear } from './linear.js';
  →
  import { linear } from '@engine/get/render/linear.js';
```
- commit "Phase 4: Convert remaining relative import to alias path"

---

### PHASE 5: Verification pass
**Risk:** N/A | **Purpose:** Confirm all 7 requirements are met

- [ ] All files have exactly 1 function (excluding state files)
- [ ] All files are inside get/set/init/dispose/state folders
- [ ] All file names match their exported function names
- [ ] All files have JSDoc
- [ ] Getter/setter naming is consistent (`get*`/`set*` prefix)
- [ ] No barrel files, wrappers, or re-exports
- [ ] All imports use alias paths
- commit "Phase 5: Final verification - all refactoring complete"

---

## Execution Order (recommended)

```
Phase 4 (trivial, do first)
Phase 1 (splits, ~3 commits)
Phase 2 (renames, ~4 commits)  
Phase 3 (JSDoc, ~4 commits)
Phase 5 (verification, 1 commit)
────────────────────────────
Total: ~13 commits
```
