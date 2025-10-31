/**
 * Open Frontier - Client Entry Point
 * Phase 0: Proof of Concept
 */

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

    // TODO: Initialize core systems
    // - Renderer (Three.js)
    // - Input handler
    // - HUD
    // - Network client

    console.log('Client initialized successfully');
    hideLoading();

    // TODO: Start game loop
    console.log('Ready to start game loop');
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
