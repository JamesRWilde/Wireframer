



// Engine now uses OBJ-style mesh files from meshes/ directory
window.OBJECTS = (
  window.MESH_LIBRARY || [
    { key: 'capsule', name: 'Capsule', build: () => window.getMeshCapsule?.() },
    { key: 'cinquefoil-knot', name: 'Cinquefoil Knot', build: () => window.getMeshCinquefoilKnot?.() },
    { key: 'cone', name: 'Cone', build: () => window.getMeshCone?.() },
    { key: 'cube', name: 'Cube', build: () => window.getMeshCube?.() },
    { key: 'cylinder', name: 'Cylinder', build: () => window.getMeshCylinder?.() },
    { key: 'diamond', name: 'Diamond', build: () => window.getMeshDiamond?.() },
    { key: 'icosahedron', name: 'Icosahedron', build: () => window.getMeshIcosahedron?.() },
    { key: 'jerusalem-cube', name: 'Jerusalem Cube', build: () => window.getMeshJerusalemCube?.() },
    { key: 'menger-sponge', name: 'Menger Sponge', build: () => window.getMeshMengerSponge?.() },
    { key: 'mobius-strip', name: 'Mobius Strip', build: () => window.getMeshMobiusStrip?.() },
    { key: 'octahedron', name: 'Octahedron', build: () => window.getMeshOctahedron?.() },
    { key: 'prism', name: 'Prism', build: () => window.getMeshPrism?.() },
    { key: 'pyramid', name: 'Pyramid', build: () => window.getMeshPyramid?.() },
    { key: 'sierpinski-pyramid', name: 'Sierpinski Pyramid', build: () => window.getMeshSierpinskiPyramid?.() },
    { key: 'sphere', name: 'Sphere', build: () => window.getMeshSphere?.() },
    { key: 'spring', name: 'Spring', build: () => window.getMeshSpring?.() },
    { key: 'star-prism', name: 'Star Prism', build: () => window.getMeshStarPrism?.() },
    { key: 'torus', name: 'Torus', build: () => window.getMeshTorus?.() },
    { key: 'torus-knot', name: 'Torus Knot', build: () => window.getMeshTorusKnot?.() },
    { key: 'tree', name: 'Tree', build: () => window.getMeshTree?.() },
    { key: 'wine-glass', name: 'Wine Glass', build: () => window.getMeshWineGlass?.() },
  ]
).filter((entry) => typeof entry?.build === 'function');
