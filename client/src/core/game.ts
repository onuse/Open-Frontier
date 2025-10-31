/**
 * Main Game Loop
 * Manages the game state and update/render cycle
 */

import { Renderer } from './renderer.js';

export class Game {
  private renderer: Renderer;
  private running: boolean = false;
  private lastTime: number = 0;

  constructor() {
    this.renderer = new Renderer();
    console.log('Game initialized');
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) {
      console.warn('Game loop already running');
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.loop();
    console.log('Game loop started');
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
    console.log('Game loop stopped');
  }

  /**
   * Main game loop
   */
  private loop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Render frame
    this.render();

    // Request next frame
    requestAnimationFrame(this.loop);
  };

  /**
   * Update game logic
   */
  private update(dt: number): void {
    // TODO: Update physics, entities, etc.
    // For now, just a placeholder
  }

  /**
   * Render the current frame
   */
  private render(): void {
    this.renderer.render();
  }

  /**
   * Get the renderer for external access
   */
  getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.renderer.dispose();
  }
}
