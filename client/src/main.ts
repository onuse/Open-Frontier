/**
 * Open Frontier - Client Entry Point
 * Phase 0: Proof of Concept
 */

import * as THREE from 'three';
import { Game } from './core/game.js';

console.log('Open Frontier - Client starting...');
console.log('Phase 0: Proof of Concept');

// Hide loading screen once initialized
const hideLoading = (): void => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
};

// Initialize application
async function init(): Promise<void> {
  try {
    console.log('Initializing client...');

    // Initialize core game systems
    const game = new Game();

    // Add a test cube to verify rendering works
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    game.getRenderer().add(cube);

    // Animate the cube for visual feedback
    const animateCube = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    };

    // Update cube in game loop (temporary)
    const originalUpdate = (game as any).update;
    (game as any).update = function (dt: number) {
      originalUpdate.call(this, dt);
      animateCube();
    };

    console.log('Client initialized successfully');
    hideLoading();

    // Start game loop
    game.start();
    console.log('Game loop running');
  } catch (error) {
    console.error('Failed to initialize client:', error);
    alert('Failed to start Open Frontier. Check console for details.');
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void init();
  });
} else {
  void init();
}
