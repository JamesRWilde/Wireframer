export const TARGET_FRAME_TIME_MS = 16.67;
export const BUDGET_HIGH = 14;
export const BUDGET_MEDIUM = 18;
export const BUDGET_LOW = 24;
export const WINDOW_SIZE = 30;
export const UPGRADE_THRESHOLD = 15;
export const DOWNGRADE_THRESHOLD = 5;

export const budgetState = {
  frameTimes: new Float32Array(30),
  frameTimeIndex: 0,
  frameTimeCount: 0,
  currentQuality: 'high',
  upgradeCounter: 0,
  downgradeCounter: 0,
};
