import { budgetState, WINDOW_SIZE } from '@engine/set/engine/frame/budgetState.js';

export function time(frameMs) {
  budgetState.frameTimes[budgetState.frameTimeIndex] = frameMs;
  budgetState.frameTimeIndex = (budgetState.frameTimeIndex + 1) % WINDOW_SIZE;
  if (budgetState.frameTimeCount < WINDOW_SIZE) budgetState.frameTimeCount++;
}
