export const TARGET_FRAME_TIME_MS = 16.67;
export const BUDGET_HIGH = 14;
export const BUDGET_MEDIUM = 18;
export const BUDGET_LOW = 24;
export const WINDOW_SIZE = 30;
export const UPGRADE_THRESHOLD = 15;
export const DOWNGRADE_THRESHOLD = 5;

export const frameTimes = new Float32Array(WINDOW_SIZE);
export let frameTimeIndex = 0;
export let frameTimeCount = 0;
export let currentQuality = 'high';
export let upgradeCounter = 0;
export let downgradeCounter = 0;
