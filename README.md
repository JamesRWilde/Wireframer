# Wireframer

Wireframer is an interactive 3D playground for exploring how procedural geometry, shading, and wireframe rendering can coexist in a clean, hackable browser app.

The goal is not just to display shapes. It is to make transformation visible: how a mesh is built, how depth affects line readability, how color themes propagate across UI and scene, and how one topology morphs into another without hiding the math.

If you like graphics code that feels alive but is still easy to reason about, this is that project.

## Why It Is Interesting

- It is intentionally bundle-free runtime JavaScript, while still split into focused modules.
- It renders the same model in two complementary styles at once: solid shading and depth-aware wireframe.
- It uses function-level seams that are easy to modify in isolation.
- It treats object definitions as pluggable units (`register + build`), so adding new geometry is straightforward.
- It makes visual decisions explainable, not magic: shading terms, edge buckets, contrast enforcement, and morph sampling are explicit in code.

## What The App Does

- Displays multiple parametric and polyhedral 3D objects on canvas.
- Lets users rotate and zoom in real time.
- Morphs between objects using sampled point correspondences and easing.
- Supports live detail scaling with model regeneration and caching.
- Supports fill and wireframe opacity controls independently.
- Supports custom RGB theming with persistence and preset/random swatches.

## Quick Start

Use a local web server because object loading relies on `fetch`.

```powershell
python -m http.server 5500
```

Open `http://localhost:5500`.

Alternative:

```powershell
npx serve . -l 5500
```

## Controls

- Drag mouse or touch to rotate.
- Scroll wheel to zoom.
- Choose a shape from the selector.
- Change `Detail` to rebuild model density.
- Adjust `Fill` and `Wireframe` opacity.
- Pick a preset or fine-tune RGB sliders.

## Runtime Flow In 30 Seconds

1. `index.html` loads `js/math3d.js`, then `js/object-system/loader.js`, then `js/app/bootstrap.js`.
2. `loader.js` builds `window.WireframeObjectsReady` by loading registry, geometry helpers, and object modules.
3. `bootstrap.js` loads app modules in strict order so globals are available when needed.
4. `render/loop.js` waits for `WireframeObjectsReady`, then calls `startApp()`.
5. `startApp()` wires controls and starts `requestAnimationFrame(frame)`.
6. Each frame updates rotation physics, then draws background, fill, wireframe, and morph overlays.

## How The Architecture Fits Together

The key idea is contract boundaries, not folder names.

### Object Contract

Every object module in `js/objects/` calls:

```js
global.WireframeObjectRegistry.register({ name, build });
```

`build(options)` returns a mesh object:

- `V`: vertex list (`[x, y, z]`).
- `E`: edge list (`[i, j]`).
- `F`: face list (`[i, j, k, ...]`, optional for pure wireframe, required for fill shading).

That simple contract keeps the rest of the pipeline generic.

### Loader and Discovery

`js/object-system/loader.js` controls object discovery and script loading.

- `readManifestFiles()` reads `js/object-system/manifest.json`.
- `discoverObjectFiles()` falls back to directory scraping, then hardcoded defaults.
- `loadScript(src)` loads modules in order with `async = false`.
- `window.WireframeObjectsReady` resolves when all object modules are loaded.

### Core Scene State

`js/app/core.js` is the runtime state hub.

- `initBackgroundParticles()` seeds animated ambient particles.
- `resize()` syncs canvas sizes and reinitializes background particles.
- `project(p)` performs perspective projection using current zoom and model vertical center.
- `computeFrameParams(vertices)` derives `MODEL_CY` and `Z_HALF` from current geometry.
- `setActiveModel(model, name, vCount, eCount)` updates active mesh and HUD values.
- `getDetailModel(obj)` builds or returns a cached shape for the current LOD bucket.
- `startMorphToObject(obj)` prepares morph endpoints and sampled point sets.
- `getMorphNowVertices(nowMs)` interpolates active morph positions at current time.

### Input and Motion

`js/app/input.js` translates pointer input into angular velocities.

- `onDown()`, `onMove()`, `onUp()` manage drag state.
- Wheel handler updates `ZOOM` with clamping.
- Rotation matrix `R` and angular velocities (`wx`, `wy`, `wz`) are consumed by the frame loop.

### UI, Colors, and Theme Propagation

`js/app/ui/controls.js` wires shape, LOD, opacity, and RGB controls.

- `syncRenderToggles()` updates `DETAIL_LEVEL`, `FILL_OPACITY`, and `WIRE_OPACITY`.
- `initObjectSelector()` populates shapes and binds events.

`js/app/ui/theme.js` turns one RGB selection into a complete visual theme.

- `buildCustomTheme(rgbInput)` derives particle, wire, fill-shade, and CSS variable colors.
- `enforceContrast(fg, bg, minRatio)` nudges colors to keep UI contrast readable.
- `initPresetSwatches()` creates clickable swatch buttons.
- `setCustomRgb(rgb, options)` updates state, storage, and active theme.
- `applyPalette()` writes CSS variables on `document.documentElement`.

`js/app/ui/color-utils.js` provides shared math helpers.

- Conversion and formatting: `toRgbCss`, `toRgbaCss`, `toHex`, `hsvToRgb`.
- Color operations: `mixRgb`, `lerpColor`, `rgbA`.
- Perceptual metrics: `relativeLuminance`, `contrastRatio`.

## Rendering Pipeline Deep Dive

### Frame Orchestration

`js/app/render/loop.js` owns the order of operations.

- `frame(nowMs)` updates rotation physics and draws all layers.
- `startApp()` initializes controls and kicks off the animation loop.

Draw order matters:

1. Background particles.
2. Fill pass (single model or cross-fade morph endpoints).
3. Wireframe pass.
4. Morph guide lines and moving points when morphing.

### Wireframe Pass

`js/app/render/wireframe.js` uses three visual sub-passes in `drawWireframeModel(model, alphaScale)`:

- Broad glow lines for soft bloom feel.
- Mid-width glow lines.
- Crisp depth-bucketed lines with color interpolation from near to far.

Depth bucketing is controlled by `DEPTH_BUCKETS` and `Z_HALF`, so edge readability scales with model depth.

### Fill Pass

`js/app/render/fill.js` does more than just paint triangles.

- `getModelTriangles(model)` normalizes mixed face sizes into triangles.
- `getModelVertexNormals(model, triFaces)` computes and caches outward vertex normals.
- `drawSolidFillModel(model, alphaScale)` does the heavy lifting:
- transforms vertices with the current rotation matrix,
- sorts triangles back-to-front,
- uses smooth shading for dense meshes,
- applies ambient + diffuse + specular (Blinn-Phong style) lighting,
- draws to an offscreen fill layer and composites once to reduce seam artifacts.

### Morph Overlay

`js/app/render/morph.js` makes topology changes legible.

- `drawMorphPoints(nowMs, tRaw, t)` draws source-to-target guide lines.
- It renders small streaked particles to communicate motion direction.
- It updates frame parameters from interpolated points so centering and depth stay stable during morph.
- It finalizes morph completion by handing control back to the target model.

## Object Construction and Detail Scaling

`js/objects/utils.js` provides reusable geometry builders:

- `buildRevolution(profile, segs)` for lathed forms.
- `buildTube(curveFn, segs, sides, tubeR)` for swept/tubular forms.
- `detailCount(maxCount, detail, minCount, step)` for snapping detail to stable counts.
- `subdivideMesh(model, iterations)` for polyhedral refinement.

Example: `js/objects/cube.js` chooses subdivision iterations from `options.detail` and then calls `subdivideMesh()`.

## Adding A New Shape

1. Create `js/objects/myShape.js`.
2. Implement and register:

```js
'use strict';

(function registerMyShape(global) {
  function buildMyShape(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    return { V: [], E: [], F: [] };
  }

  global.WireframeObjectRegistry.register({ name: 'My Shape', build: buildMyShape });
})(window);
```

3. Update manifest with:

```powershell
node tools/generate-object-manifest.mjs
```

4. Reload the app and confirm it appears in the shape selector.

## Performance Notes

- Model cache in `core.js` avoids rebuilding same shape/LOD repeatedly.
- Fill pass caches triangulation and vertex normals on model objects.
- Rotation matrix is re-orthogonalized periodically in `frame()` to prevent drift.
- Offscreen fill compositing helps avoid visible alpha seam accumulation.

## Troubleshooting

- `Shape list empty`: Ensure the app is served over HTTP, check `js/object-system/manifest.json`, and verify your module calls `WireframeObjectRegistry.register`.
- `App says failed to load`: Check the browser console and network tab for missing script paths.
- `LOD slider has no effect`: Ensure your shape's `build(options)` uses `options.detail`.
