// Object list for mesh selection
export const OBJECTS = [
  'capsule.obj',
  'cinquefoil-knot.obj',
  'cone.obj',
  'cube.obj',
  'cylinder.obj',
  'diamond.obj',
  'icosahedron.obj',
  'jerusalem-cube.obj',
  'menger-sponge.obj',
  'mobius-strip.obj',
  'octahedron.obj',
  'prism.obj',
  'pyramid.obj',
  'sierpinski-pyramid.obj',
  'sphere.obj',
  'spring.obj',
  'star-prism.obj',
  'torus-knot.obj',
  'torus.obj',
  'wine-glass.obj'
].map(filename => {
  const key = filename.replace(/\.obj$/i, '');
  // Convert to Title Case for display
  const name = key.replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());
  return { key, name, obj: `meshes/${filename}` };
});
