// Telemetry DOM element references used across UI and core loops
let _statRenderer = null;
let _statFps = null;
let _statFrameMs = null;
let _statPhysMs = null;
let _statBgMs = null;
let _statFgMs = null;
let _statV = null;
let _statE = null;

export function setStatRenderer(el) { _statRenderer = el; }
export function setStatFps(el) { _statFps = el; }
export function setStatFrameMs(el) { _statFrameMs = el; }
export function setStatPhysMs(el) { _statPhysMs = el; }
export function setStatBgMs(el) { _statBgMs = el; }
export function setStatFgMs(el) { _statFgMs = el; }
export function setStatV(el) { _statV = el; }
export function setStatE(el) { _statE = el; }

export function getStatRenderer() { return _statRenderer; }
export function getStatFps() { return _statFps; }
export function getStatFrameMs() { return _statFrameMs; }
export function getStatPhysMs() { return _statPhysMs; }
export function getStatBgMs() { return _statBgMs; }
export function getStatFgMs() { return _statFgMs; }
export function getStatV() { return _statV; }
export function getStatE() { return _statE; }
