// Engine now uses OBJ-style mesh files from meshes/ directory
window.OBJECTS = (
  (window.MESH_LIBRARY || [
    { key: 'car', name: 'Car', build: () => window.getMeshCar?.() },
    { key: 'airplane', name: 'Airplane', build: () => window.getMeshAirplane?.() },
    { key: 'dog', name: 'Dog', build: () => {
      const mesh = window.getMeshDog?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Dog mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'capsule', name: 'Capsule', build: () => {
      const mesh = window.getMeshCapsule?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Capsule mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'cinquefoil-knot', name: 'Cinquefoil Knot', build: () => {
      const mesh = window.getMeshCinquefoilKnot?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Cinquefoil Knot mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'cone', name: 'Cone', build: () => {
      const mesh = window.getMeshCone?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Cone mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'cube', name: 'Cube', build: () => {
      const mesh = window.getMeshCube?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Cube mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'cylinder', name: 'Cylinder', build: () => {
      const mesh = window.getMeshCylinder?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Cylinder mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'diamond', name: 'Diamond', build: () => {
      const mesh = window.getMeshDiamond?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Diamond mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'icosahedron', name: 'Icosahedron', build: () => {
      const mesh = window.getMeshIcosahedron?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Icosahedron mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'jerusalem-cube', name: 'Jerusalem Cube', build: () => {
      const mesh = window.getMeshJerusalemCube?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Jerusalem Cube mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'menger-sponge', name: 'Menger Sponge', build: () => {
      const mesh = window.getMeshMengerSponge?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Menger Sponge mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'mobius-strip', name: 'Mobius Strip', build: () => {
      const mesh = window.getMeshMobiusStrip?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Mobius Strip mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'octahedron', name: 'Octahedron', build: () => {
      const mesh = window.getMeshOctahedron?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Octahedron mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'prism', name: 'Prism', build: () => {
      const mesh = window.getMeshPrism?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Prism mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'pyramid', name: 'Pyramid', build: () => {
      const mesh = window.getMeshPyramid?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Pyramid mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'sierpinski-pyramid', name: 'Sierpinski Pyramid', build: () => {
      const mesh = window.getMeshSierpinskiPyramid?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Sierpinski Pyramid mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'sphere', name: 'Sphere', build: () => {
      const mesh = window.getMeshSphere?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Sphere mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'spring', name: 'Spring', build: () => {
      const mesh = window.getMeshSpring?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Spring mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'star-prism', name: 'Star Prism', build: () => {
      const mesh = window.getMeshStarPrism?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Star Prism mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'torus', name: 'Torus', build: () => {
      const mesh = window.getMeshTorus?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Torus mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'torus-knot', name: 'Torus Knot', build: () => {
      const mesh = window.getMeshTorusKnot?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Torus Knot mesh build returned undefined/null');
      }
      return mesh;
    } },
    { key: 'wine-glass', name: 'Wine Glass', build: () => {
      const mesh = window.getMeshWineGlass?.();
      if (mesh === undefined || mesh === null) {
        console.warn('[loader.js] Wine Glass mesh build returned undefined/null');
      }
      return mesh;
    } },
  ])
).filter((entry) => typeof entry?.build === 'function');










