import { optimalPosition } from './optimalPosition.js';
import { evaluateQuadric } from './evaluateQuadric.js';

export function edgeCost(v1, v2) {
  const pos = optimalPosition(v1, v2);
  return evaluateQuadric(v1.quadric, pos) + evaluateQuadric(v2.quadric, pos);
}
