"use strict";

let particles = [];

let state = {
  density: 50,
  speed: 1,
  width: 1920,
  height: 1080,
  themeMode: 'dark'
};

import { InitWorkersParticles } from './init/InitWorkersParticles.js';
import { SetWorkersUpdateParticles } from './set/SetWorkersUpdateParticles.js';
import { GetWorkersPackParticles } from './get/GetWorkersPackParticles.js';

onmessage = (event) => {
  const { type, width, height, density, speed, timestamp, themeMode } = event.data;

  try {
    switch (type) {
      case 'init':
        state.width = width;
        state.height = height;
        state.density = density || 1;
        state.speed = speed || 1;
        state.themeMode = themeMode || 'dark';
        InitWorkersParticles(state, particles);
        postMessage({ type: 'ready' });
        break;

      case 'update': {
        if (density && density !== state.density) {
          state.density = density;
          InitWorkersParticles(state, particles);
        }
        if (speed !== undefined) {
          state.speed = speed;
        }
        if (themeMode) {
          state.themeMode = themeMode;
        }

        const velScale = state.speed;
        const opacityScale = event.data.opacity || 1;
        const themeAlphaBoost = state.themeMode === 'light' ? 1.75 : 1;

        SetWorkersUpdateParticles(particles, state.width, state.height, timestamp || 0, velScale, opacityScale, themeAlphaBoost);
        const data = GetWorkersPackParticles(particles);
        postMessage({ type: 'particles', data, count: particles.length }, [data.buffer]);
        break;
      }

      case 'resize': {
        state.width = width;
        state.height = height;
        InitWorkersParticles(state, particles);
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message, stack: error.stack });
  }
};
