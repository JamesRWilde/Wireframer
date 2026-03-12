// Morph state - shared state for morphing operations
export const morphState = {
  active: false,
  startTime: 0,
  duration: 0,
  fromMesh: null,
  toMesh: null,
  currentMesh: null,
  progress: 0,
  onComplete: null,
};
