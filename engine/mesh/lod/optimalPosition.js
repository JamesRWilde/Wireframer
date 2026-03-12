export function optimalPosition(v1, v2) {
  return [
    (v1.position[0] + v2.position[0]) / 2,
    (v1.position[1] + v2.position[1]) / 2,
    (v1.position[2] + v2.position[2]) / 2,
  ];
}
