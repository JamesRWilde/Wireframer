/**
 * inputCanvasState.js - Input canvas reference state
 *
 * PURPOSE:
 *   Store and retrieve the current input canvas reference in a single state module.
 *   Avoids globalThis._inputCanvas usage and enables test-friendly access.
 */

"use strict";

/** @type {?HTMLCanvasElement} */
let _inputCanvas = null;

export function getInputCanvas() {
  return _inputCanvas;
}

export function setInputCanvas(canvas) {
  _inputCanvas = canvas;
}
