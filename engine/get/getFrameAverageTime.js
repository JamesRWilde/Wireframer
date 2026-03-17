import * as state from '../frame/frameBudgetState.js';

export function getFrameAverageTime() {
  if (state.frameTimeCount === 0) return 0;
  let sum = 0;
  for (let i = 0; i < state.frameTimeCount; i++) {
    sum += state.frameTimes[i];
  }
  return sum / state.frameTimeCount;
}
