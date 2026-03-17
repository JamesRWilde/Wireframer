import { budgetState } from '@engine/set/engine/frame/budgetState.js';

export function averageTime() {
  if (budgetState.frameTimeCount === 0) return 0;
  let sum = 0;
  for (let i = 0; i < budgetState.frameTimeCount; i++) {
    sum += budgetState.frameTimes[i];
  }
  return sum / budgetState.frameTimeCount;
}
