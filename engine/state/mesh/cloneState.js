/**
 * cloneState.js - Mesh cloning state abstraction
 *
 * PURPOSE:
 *   Allows safe use of a configurable clone function in place of globalThis.clone.
 */

"use strict";

/** @type {function|null} */
let _cloneFn = null;

export function getClone() { return _cloneFn; }
export function setClone(fn) { _cloneFn = fn; }
