import { rmSync, mkdirSync } from 'fs';

export default function globalSetup() {
  rmSync('test-results', { recursive: true, force: true });
  mkdirSync('test-results', { recursive: true });
}
