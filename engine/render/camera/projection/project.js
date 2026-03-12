export function project(p) {
  const fov = Math.min(window.innerWidth, window.innerHeight) * 0.9 * globalThis.ZOOM;
  const d   = p[2] + 3;
  return [
    window.innerWidth * 0.5 + p[0] * fov / d,
    window.innerHeight * 0.5 - (p[1] - globalThis.MODEL_CY) * fov / d,
  ];
}