/**
 * forensicLog.js - Forensic Trace Logger
 *
 * PURPOSE:
 *   Records function entry/exit with timestamps to a ring buffer.
 *   Flushes batches to the server every N ms so Neo can read wireframer.log
 *   directly without asking James to copy console output.
 *
 * USAGE:
 *   import { trace, flushNow, getLogDump } from '@engine/state/render/forensicLog.js';
 *
 *   // Manual: wrap a function
 *   export function myFunc(x) {
 *     const end = trace('myFunc', { x });
 *     // ... work ...
 *     end({ result: 'ok' });  // logs exit with duration
 *   }
 *
 *   // Read the file from disk:
 *   cat wireframer.log
 *
 *   // Or get a string dump from console:
 *   getLogDump()  -> returns formatted string
 *
 *   // Force flush pending entries to file:
 *   flushNow()
 *
 * SERVER:
 *   POST /api/log  accepts array of { t, cat, fn, phase, data }
 *   Writes to wireframer.log in project root.
 *
 * RING BUFFER:
 *   Defaults to 5000 entries. Oldest entries are dropped when full.
 */

"use strict";

// ── Ring buffer ──
const MAX_ENTRIES = 5000;
let _buffer = [];
let _flushTimer = null;
const FLUSH_INTERVAL_MS = 1000; // flush every 1s
const LOG_URL = '/api/log';

/**
 * trace - Record a function entry, returns an end() callback.
 *
 * @param {string} fn - Function name (e.g. 'renderMeshUnified')
 * @param {string} [cat='fn'] - Category (fn, render, physics, ui, gpu, input)
 * @param {Object} [data] - Optional data to attach to the entry event
 * @returns {function} end - Call end(exitData?) to record the exit event
 *
 * Example:
 *   const end = trace('physicsStep', 'physics', { dt });
 *   // ... do work ...
 *   end({ energy });  // logs exit with elapsed time
 */
export function trace(fn, cat = 'fn', data) {
  const startMs = performance.now();
  const startPerf = performance.now(); // high-res for duration

  _push({
    t: startMs,
    cat,
    fn,
    phase: '>',
    data: data || undefined,
  });

  _scheduleFlush();

  // Return an end() function with closure over start time
  return function end(exitData) {
    const endMs = performance.now();
    _push({
      t: endMs,
      cat,
      fn,
      phase: '<',
      data: exitData ? { ...exitData, _ms: +(endMs - startPerf).toFixed(3) } : { _ms: +(endMs - startPerf).toFixed(3) },
    });
  };
}

/**
 * mark - Record a single instant event (no duration).
 *
 * @param {string} fn - Name of the event
 * @param {string} [cat='fn'] - Category
 * @param {Object} [data] - Optional data
 */
export function mark(fn, cat = 'fn', data) {
  _push({
    t: performance.now(),
    cat,
    fn,
    phase: '*',
    data: data || undefined,
  });
  _scheduleFlush();
}

/**
 * getLogDump - Return the entire ring buffer as a formatted string.
 * Call from browser console: getLogDump() then copy the output.
 *
 * @returns {string} Formatted log text
 */
export function getLogDump() {
  return _buffer.map(e => {
    const t = e.t.toFixed(3);
    const dataStr = e.data ? ' ' + JSON.stringify(e.data) : '';
    return `[${t}] ${e.cat} ${e.fn} ${e.phase}${dataStr}`;
  }).join('\n');
}

/**
 * getEntries - Return raw entries array (for programmatic analysis).
 *
 * @returns {Array} Copy of the ring buffer
 */
export function getEntries() {
  return [..._buffer];
}

/**
 * clearLog - Clear the ring buffer.
 */
export function clearLog() {
  _buffer = [];
}

/**
 * flushNow - Force-flush pending entries to the server immediately.
 */
export async function flushNow() {
  _cancelFlush();
  await _doFlush();
}

// ── Internal ──

function _push(entry) {
  if (_buffer.length >= MAX_ENTRIES) {
    _buffer.splice(0, _buffer.length - MAX_ENTRIES + 1); // drop oldest
  }
  _buffer.push(entry);
}

function _scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    _doFlush();
  }, FLUSH_INTERVAL_MS);
}

function _cancelFlush() {
  if (_flushTimer) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
}

async function _doFlush() {
  if (_buffer.length === 0) return;

  // Grab a snapshot and clear (entries stay in ring buffer for getLogDump)
  const batch = _buffer.slice();
  _buffer = [];

  try {
    const res = await fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.warn('[forensicLog] flush failed:', res.status);
    }
  } catch (err) {
    // Server might be down, re-buffer (with cap)
    console.warn('[forensicLog] flush error:', err.message);
    for (const e of batch) _push(e);
  }
}

// Expose to console for manual access
if (typeof window !== 'undefined') {
  window.getLogDump = getLogDump;
  window.flushNow = flushNow;
  window.clearLog = clearLog;
}
