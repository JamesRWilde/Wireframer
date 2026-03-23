# Wireframer

A real-time 3D wireframe and solid-fill viewer running entirely in the browser. Built with vanilla JavaScript, zero build step, and a radical one-function-per-file architecture. Load any OBJ mesh, rotate and zoom it with mouse or touch, morph smoothly between shapes, and fine-tune every visual parameter through a live control panel.

Wireframer is not a wrapper around Three.js. It is a from-scratch rendering engine with its own WebGL pipeline, its own mesh decimation algorithm, its own OBJ parser, and its own background particle system running on a Web Worker. Every line of code is visible, auditable, and replaceable.

---

## What You Get

- **Dual Rendering Pipeline** — Solid shading and wireframe overlay composed together with depth-aware color interpolation, running on GPU (WebGL) when available with automatic CPU fallback
- **35 Mesh Objects** — Classic shapes, vehicles, animals, and fractals including torus, icosahedron, sierpinski pyramid, cinquefoil knot, airplane, drone, cat, dog, and more
- **Smooth Morphing** — Real-time vertex interpolation between any two objects with configurable duration
- **LOD Slider** — Live mesh decimation using a greedy cluster algorithm with per-level caching
- **Background Particles** — Animated ambient particles computed on a Web Worker to keep the main thread free
- **Theme Engine** — Dark and light modes, custom RGB color control, preset swatches, contrast enforcement, and localStorage persistence
- **Full Control Panel** — Fill opacity, wire opacity, particle density, particle velocity, background opacity, edge color, and wire far-color all adjustable live
- **Performance Telemetry** — Live FPS, frame time, physics update time, and render time display

---

## Running

```bash
npm install
npm start
```

Open `http://localhost:3000` in a modern browser. The dev server uses nodemon and auto-restarts on file changes.

### Alternative

Any static file server works. The app is pure ES modules — no build step.

```bash
npx serve . -l 3000
```

---

## Controls

| Input | Action |
|-------|--------|
| Mouse drag / Touch | Rotate model |
| Scroll wheel | Zoom in/out |
| Shape selector dropdown | Choose 3D object |
| LOD slider | Adjust model detail level |
| Fill opacity | Solid shading visibility |
| Wire opacity | Wireframe visibility |
| Background controls | Particle density, velocity, opacity |
| RGB sliders | Custom theme color |
| Theme mode | Dark / Light toggle |

---

## Architecture

Wireframer is built on two fundamental principles:

1. **One function per file** — Every module exports exactly one function. No barrel exports, no multi-function files, no exceptions.
2. **Three-layer separation** — Every operation is split across `get/` (read), `set/` (write), and `state/` (hold).

This is not convention. It is enforced architecture. You can trace any value from its definition in a `state/` file through every getter that reads it and every setter that writes it.

### Directory Layout

```
Wireframer/
├── index.html                    # Entry point — loads modules via importmap
├── server.js                     # Express dev server (port 3000)
├── js/
│   └── startApp.js               # Bootstrap: canvas, pipeline, controls, frame loop
├── engine/
│   ├── init/                     # One-time initialization
│   │   ├── mesh/                 # OBJ parsing, mesh pipeline, LOD, morphing
│   │   ├── render/               # Canvas, input, render pipeline, background worker
│   │   └── gpu/                  # WebGL context, shaders, buffer setup
│   ├── get/                      # Pure getters — no side effects, return state
│   │   ├── mesh/                 # Mesh queries (morph state, raw text, validation)
│   │   ├── render/               # Render state queries (colors, dimensions, theme)
│   │   └── gpu/                  # GPU state queries (renderer, GL context)
│   ├── set/                      # Mutators and actions — change state, render, compute
│   │   ├── mesh/                 # Mesh operations (detail level, morph triggers)
│   │   ├── render/               # Render operations (paths, scenes, backgrounds, toggles)
│   │   ├── engine/               # Engine operations (frame loop)
│   │   └── gpu/                  # GPU operations (draw, canvas visibility)
│   ├── state/                    # Plain state objects — no logic, just data
│   │   ├── mesh/                 # Morph state, mesh parse errors
│   │   ├── render/               # Render params, zoom, physics, background, colors
│   │   └── gpu/                  # GPU scene state
│   └── dispose/                  # Cleanup and teardown
├── ui/
│   ├── get/                      # UI getters (DOM state reads)
│   ├── set/                      # UI actions (slider sync, theme mode, stat display)
│   ├── state/                    # UI state (persisted settings)
│   └── init/                     # Control binding and initialization
├── workers/
│   └── workersBackground.js      # Web Worker for background particle animation
├── meshes/                       # OBJ mesh files (*.obj)
└── css/                          # Styles
```

### The Three-Layer Pattern

Every piece of data in Wireframer exists in exactly one `state/` file as a plain object. It is read through a `get/` function and written through a `set/` function. There is no mixing.

```javascript
// state/render/renderState.js — the source of truth
export const renderState = {
  theme: null,
  themeMode: 'dark',
  fillOpacity: 1,
  wireOpacity: 1,
  wireWidth: 0.2,
  themeVer: 0,
  cacheVer: -1,
  shadeDarkRgb: [0, 0, 0],
  shadeBrightRgb: [255, 255, 255],
  fillRgb: [0, 200, 120],
  edgeColor: '#ffffff',
  bgRgb: [0, 0, 0],
  bgColor: 'rgba(0,0,0,1)',
  particleColor: 'rgba(200,220,255,1)',
};

// get/render/getTheme.js — read access
export function getTheme() {
  return renderState.theme;
}

// set/render/setTheme.js — write access
export function setTheme(theme) {
  renderState.theme = theme;
}
```

This separation means:
- You can always find where a value lives (it's in exactly one `state/` file)
- You can always find who reads it (grep the `get/` import)
- You can always find who writes it (grep the `set/` import)
- No circular dependencies — `state/` files import nothing from `get/` or `set/`, and `get/` files only import from `state/`

### Import Map

Wireframer uses a browser-native import map in `index.html` to provide clean module paths:

```json
{
  "imports": {
    "@engine/": "./engine/",
    "@ui/": "./ui/"
  }
}
```

This means imports read like `import { getTheme } from '@engine/get/render/getTheme.js'` rather than fragile relative paths like `../../../get/render/getTheme.js`.

---

## Key Systems

### Mesh Pipeline

All meshes — whether built-in parametric or loaded from OBJ files — go through the same normalization pipeline.

**OBJ Loading Flow:**
```
OBJ text → toRuntime() → { V, F, E } → load() → normalizeToBoundingSphere() → finalizeModel()
```

**The Sphere Law:** Every mesh is normalized to a unit bounding sphere (radius 1, centre at origin). This is the contract that makes the rendering pipeline work:

- **Size = zoom** — All meshes are the same size, so zoom controls scale uniformly across all objects
- **Centre = origin** — Always centred on screen, no offset calculations needed
- **Rotation pivots around sphere centre** — Natural-looking rotation for every shape

The normalization pipeline: compute bounding box → find sphere centre → compute max radius → scale all vertices to unit sphere → clamp any floating-point overflow.

### Mesh Format

Every mesh conforms to the same contract:

| Property | Type | Description |
|----------|------|-------------|
| `V` | `[[x, y, z], ...]` | Vertex positions |
| `F` | `[[i, j, k], ...]` | Face indices (triangles) |
| `E` | `[[i, j], ...]` | Edge index pairs (wireframe) |

### LOD (Level of Detail)

Wireframer includes a custom greedy cluster decimation algorithm that reduces mesh complexity on-the-fly:

1. Assign vertices to spatial grid cells
2. Merge nearby vertices within each cell
3. Rebuild face and edge indices for the reduced vertex set
4. Cache the result for instant retrieval at the same detail level

The LOD slider goes from full detail (100%) down to a minimum of 4 faces (a tetrahedron). Each level is cached after first computation, so dragging the slider back to a previously visited level is instant.

### Dual Rendering Pipeline

The frame loop calls exactly one render path per frame — determined at startup, not per-frame:

```javascript
// At init time: pick one pipeline, never switch per-frame
renderForeground = gpuPath;   // or cpuPath
```

**GPU Path (WebGL):**
- Two shader programs: fill (Blinn-Phong lighting) and wire (depth-based color interpolation)
- Orthographic projection — no perspective distortion, true to engineering drawing aesthetics
- Fill normals are per-face, computed at load time and uploaded as vertex attributes
- Wire color fades from `wireNear` to `wireFar` based on depth, giving a subtle parallax effect
- Falls back to CPU automatically if WebGL context or shader compilation fails

**CPU Path (Canvas 2D):**
- Triangle-by-triangle fill with back-to-front painter's compositing
- Depth-bucketed wireframe rendering with color interpolation
- Offscreen fill layer compositing to reduce edge artifacts

**Switching modes** is a dispose-and-reinit operation: tear down the active pipeline, swap the function pointer, initialize the other. This is a one-time cost, not per-frame.

### Background Particles

Background particles run on a **Web Worker** to keep the main thread free for rendering:

```
Main thread → posts { init | update | resize } → Worker
Worker → posts { ready | particles } → Main thread
```

Particle data is transferred as `Float32Array` with zero-copy semantics. The worker computes positions, the main thread renders them on the background canvas.

Particle behaviour:
- Drift with configurable velocity
- Fade in and out with sinusoidal alpha cycling
- Scale with size variance for depth effect
- Density is user-controllable via slider (0–1, mapped to particle count)
- GPU mode gets larger, more opaque particles for visual balance

### Morphing System

The morph system provides smooth vertex interpolation between any two meshes:

1. `startMorph(from, to, duration)` — Sets up the morph: clones source and target meshes, records start time
2. `advanceMorphFrame()` — Called each frame, interpolates vertex positions by a lerp factor based on elapsed time
3. `currentMorph()` — Returns the interpolated mesh for rendering
4. `isMorphing()` — Returns whether a morph is in progress

The morph API is initialized in `initMorphApi.js` and exposed globally via `window.morph`. Duration defaults to 1600ms.

### Theme System

Themes control the entire visual appearance. Each theme is a complete color palette:

```javascript
{
  name: 'dark',
  bg: '#191919',
  fill: '#2a363b',
  edge: '#e8e6e3',
  wireFar: '#6b6b6b',
  shadeDark: [0.10, 0.10, 0.10],
  shadeBright: [0.78, 0.78, 0.78],
  particleColour: [230, 230, 230],
  particleAlpha: 0.35,
  particleAlphaMin: 0.12
}
```

Themes enforce **contrast rules**: background brightness determines whether wire color is light or dark. Custom RGB values are validated against the background to prevent invisible wireframes.

All theme changes persist to `localStorage` and are restored on next visit.

### UI Control System

The control panel is organized into three sections:
- **Scene Controls** — Shape selector, LOD slider, fill and wire opacity
- **Background Controls** — Density, velocity, and background opacity
- **Theme Controls** — RGB sliders, color picker, preset swatches, theme mode toggle

All controls bind to state through `set/` functions. State changes trigger `syncRenderToggles()` which reads every slider value and writes to the corresponding state module. There are no direct DOM reads in the render loop — everything flows through state.

---

## Frame Loop

The animation frame loop is the heartbeat of the application:

```
setRunFrame (called by setAnimationFrame via requestAnimationFrame)
├── getShouldRunFrame()       — FPS limiting: skip frame if running too fast
├── setPhysics()              — Update rotation velocity and state
├── getBudget()               — Check frame budget, adjust quality if needed
├── setScene()                — Render background + foreground (one path only)
│   ├── Background: CPU draw on bgCanvas or GPU particle pipeline
│   └── Foreground: gpuPath (WebGL) or cpuPath (Canvas 2D triangle fill)
├── setFrameTime()            — Record frame duration for budget tracking
├── setTelemetryState()       — Collect timing metrics (physics, bg, fg, interval)
└── setTelemetryHud()         — Update live FPS and timing display
```

Each frame tracks physics time, background render time, and foreground render time separately. The telemetry panel shows live FPS, frame time, physics update time, and render time.

---

## Adding Objects

### Built-in Shapes

Shapes are defined as OBJ files in the `meshes/` directory. The object list is served from the server. Add an OBJ file and it appears in the shape selector.

### From Code

```javascript
import { getLoadObjMesh } from '@engine/get/mesh/getLoadObjMesh.js';

const loadObjMesh = getLoadObjMesh();
await loadObjMesh('/meshes/myShape.obj', 'My Shape');
```

The mesh goes through the full normalization pipeline automatically: parsed, edges built, normalised to bounding sphere, LOD range set, and finalised for rendering with an optional morph transition.

---

## Development

### Code Conventions

- **One function per file** — No exceptions
- **No barrel exports** — Each file is imported directly
- **get/set/state separation** — Every value has a getter, a setter, and exactly one state home
- **No build step** — ES modules in the browser, served directly
- **Import map over relative paths** — `@engine/` prefix, no `../../../` chains
- **JSDoc on every function** — PURPOSE, ARCHITECTURE ROLE, and parameter documentation

### What Not To Do

- Do not put two functions in one file
- Do not import a `get/` function from a `set/` file (breaks the layer boundary)
- Do not read `state/` objects directly outside of `get/` files (use the getter)
- Do not use relative paths when an `@engine/` or `@ui/` alias exists

### Key Files for New Contributors

| File | What It Does |
|------|--------------|
| `js/startApp.js` | Bootstrap and orchestration — read this first to see the full init flow |
| `engine/init/mesh/initLoad.js` | Mesh loading pipeline — the core data flow |
| `engine/init/render/pipeline/initRenderPipeline.js` | GPU/CPU detection and pipeline init |
| `engine/set/engine/frame/setAnimationFrame.js` | The frame loop — everything that happens each frame |
| `engine/init/gpu/create/initCreateScenePrograms.js` | WebGL shaders — fill and wire programs |
| `engine/init/mesh/initGreedyClusterDecimator.js` | LOD algorithm |
| `workers/workersBackground.js` | Background particle worker |
| `ui/init/attach/initAttachSliderListeners.js` | UI control binding |

---

## License

Provided as-is for educational and personal use.
