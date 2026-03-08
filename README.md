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
- Includes fractal-inspired objects such as Menger sponge, Sierpinski variants, Jerusalem cube, and Hilbert pipe.
- Lets users rotate and zoom in real time.
- Morphs between objects using sampled point correspondences and easing.
- Supports live detail scaling with model regeneration and caching.
- Supports fill and wireframe opacity controls independently.
- Supports background particle density, velocity, and opacity controls.
- Supports custom RGB theming with persistence and preset/random swatches.
- Auto-selects GPU foreground rendering when available, with CPU fallback.
- Exposes live performance stats (FPS, frame/physics/background/foreground timings).

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
- Adjust `Background` density, velocity, and opacity.
- Pick a preset or fine-tune RGB sliders.

## Runtime Flow In 30 Seconds

1. `index.html` loads `js/math3d.js`, then `js/object-system/loader.js`, then `js/app/bootstrap.js`.
2. `loader.js` builds `window.WireframeObjectsReady` by loading registry, geometry helpers, and object modules.
3. `bootstrap.js` loads app modules in strict order so globals are available when needed.
4. `render/loop.js` waits for `WireframeObjectsReady`, then calls `startApp()`.
5. `startApp()` wires controls and starts `requestAnimationFrame(frame)`.
6. Each frame updates rotation physics, then draws background plus foreground through GPU or CPU paths.
7. Telemetry HUD values are updated with smoothed timings on a throttled cadence.

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
- Script URLs are cache-busted per session (`?v=<token>`) so module edits are reflected reliably during development.

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
- `getModelFrameData(model)` caches transformed/projected vertices per render frame for hot-path reuse.

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
- Foreground mode is selected at runtime (`GPU` preferred, `CPU` fallback).
- By default the loop is uncapped (`MAX_FPS = 0`) and FPS is measured from presented frame intervals.

Draw order matters:

1. Background particles.
2. Foreground model rendering (GPU combined pass or CPU fill + wireframe passes).
3. Telemetry HUD updates (`FPS`, `Frame ms`, `Phys ms`, `Bg ms`, `Fg ms`) at a throttled interval.

### GPU Foreground Path

`js/app/render/scene-gpu.js` provides the WebGL foreground renderer.

- Uses compiled shader programs for fill and wire rendering.
- Reuses typed arrays and dynamic buffers for low allocation overhead.
- Supports dynamic geometry updates for morphing (`dynamic: true`).
- Falls back gracefully when context/program setup fails.

### Wireframe Pass

When CPU foreground is active, `js/app/render/wireframe.js` uses three visual sub-passes in `drawWireframeModel(model, alphaScale)`:

- Broad glow lines for soft bloom feel.
- Mid-width glow lines.
- Crisp depth-bucketed lines with color interpolation from near to far.

Depth bucketing is controlled by `DEPTH_BUCKETS` and `Z_HALF`, so edge readability scales with model depth.

### Fill Pass

When CPU foreground is active, `js/app/render/fill.js` does more than just paint triangles.

- `getModelTriangles(model)` normalizes mixed face sizes into triangles.
- `getModelVertexNormals(model, triFaces)` computes and caches outward vertex normals.
- `drawSolidFillModel(model, alphaScale)` does the heavy lifting:
- transforms vertices with the current rotation matrix,
- sorts triangles back-to-front,
- uses smooth shading for dense meshes,
- applies ambient + diffuse + specular (Blinn-Phong style) lighting,
- draws to an offscreen fill layer and composites once to reduce seam artifacts.

### Morph Overlay

`js/app/render/morph.js` contains morph helpers and optional overlay rendering utilities.

- `drawMorphPoints(nowMs, tRaw, t)` draws source-to-target guide lines.
- It renders small streaked particles to communicate motion direction.
- It updates frame parameters from interpolated points so centering and depth stay stable during morph.
- It finalizes morph completion by handing control back to the target model.

Current default loop behavior focuses on direct mesh morph rendering in the main foreground path.

## Object Construction and Detail Scaling

`js/objects/utils.js` provides reusable geometry builders:

- `buildRevolution(profile, segs)` for lathed forms.
- `buildTube(curveFn, segs, sides, tubeR)` for swept/tubular forms.
- `detailCount(maxCount, detail, minCount, step)` for snapping detail to stable counts.
- `subdivideMesh(model, iterations)` for polyhedral refinement.

Many newer shapes map detail to explicit min/max ranges or recursion order (instead of raw linear vertex scaling) so low detail stays clearly low-poly and high detail remains practical.

Current object set is defined in `js/object-system/manifest.json`.

### Object Catalog (Quick Reference)

| Shape Group | Examples | Detail Strategy | Cost Profile |
| --- | --- | --- | --- |
| Revolved surfaces | `sphere`, `cone`, `cylinder`, `wineGlass` | Explicit min/max stack/segment interpolation | Low -> medium; predictable |
| Tubular parametrics | `torus`, `torusKnot`, `spring`, `cinquefoilKnot`, `mobiusStrip` | Curve segment and tube-side scaling | Medium -> high with dense curve sampling |
| Subdivided polyhedra | `cube`, `tetrahedron`, `icosahedron`, `pyramid`, `octahedron` | Iteration thresholds mapped from slider | Stepwise growth; can jump per tier |
| Faceted solids | `diamond`, `prism`, `starPrism` | Discrete facet count / fixed topology variants | Low -> medium |
| Fractal solids | `mengerSponge`, `sierpinskiTetrahedron`, `sierpinskiPyramid`, `jerusalemCube` | Recursion depth mapping (cached by level) | Exponential growth; cap max tiers conservatively |
| Curve-as-solid | `hilbertCurve` | Hilbert order mapped from slider, rendered as tube | Medium; rises quickly with order |

Notes:
- For fractal and curve-order objects, slider tuning should prioritize readable structure over maximum raw vertex count.
- If an object becomes visually noisy above mid detail, prefer reducing top-tier recursion/order before changing low/mid tiers.

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
- Frame-level transform/projection cache (`getModelFrameData`) reduces repeated math in CPU passes.
- GPU path uses buffer updates and typed-array reuse for dynamic geometry.
- Rotation matrix is re-orthogonalized periodically in `frame()` to prevent drift.
- Offscreen fill compositing helps avoid visible alpha seam accumulation.
- Telemetry HUD uses EMA smoothing and throttled DOM updates to stay informative with low overhead.

## Troubleshooting

- `Shape list empty`: Ensure the app is served over HTTP, check `js/object-system/manifest.json`, and verify your module calls `WireframeObjectRegistry.register`.
- `App says failed to load`: Check the browser console and network tab for missing script paths.
- `LOD slider has no effect`: Ensure your shape's `build(options)` uses `options.detail`.
