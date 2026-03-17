
export function time(frameMs) {
  state.frameTimes[state.frameTimeIndex] = frameMs;
  state.frameTimeIndex = (state.frameTimeIndex + 1) % state.WINDOW_SIZE;
  if (state.frameTimeCount < state.WINDOW_SIZE) state.frameTimeCount++;
}
