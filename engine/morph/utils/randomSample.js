/**
 * randomSample.js - Unique Random Sampling from Array
 *
 * PURPOSE:
 *   Selects a specified number of unique random elements from an array.
 *   Used for mesh sampling, morphing, and any context where a random subset
 *   of unique items is needed for performance or statistical reasons.
 *
 * ARCHITECTURE ROLE:
 *   Utility for morphing and mesh mapping. Ensures that random subsets
 *   are selected efficiently and without duplicates.
 *
 * HOW IT WORKS:
 *   1. If count >= arr.length, returns a shallow copy of arr
 *   2. Otherwise, repeatedly selects random indices until 'count' unique
 *      elements are chosen (using a Set to avoid duplicates)
 *   3. Returns the sampled elements in a new array
 *
 * @param {Array} arr - Source array
 *   The array to sample from.
 * @param {number} count - Number of samples
 *   The number of unique random elements to select.
 * @returns {Array} Random sample of elements
 *   New array of 'count' unique random elements from arr. If count >= arr.length,
 *   returns a shallow copy of arr.
 */

"use strict";
export function randomSample(arr, count) {
  const n = arr.length;
  // If count >= n, return a shallow copy of the array
  if (count >= n) return arr.slice();
  const result = [];
  const used = new Set();
  // Select unique random indices until result is full
  while (result.length < count) {
    const idx = Math.floor(Math.random() * n);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
}
