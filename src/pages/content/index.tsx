import { createRoot } from 'react-dom/client';
import Browser from 'webextension-polyfill';
import './style.css';

// Create root element for React
const createRootElement = () => {
  const div = document.createElement('div');
  div.id = '__prompetize_root';
  div.style.position = 'fixed';
  div.style.zIndex = '9999';
  document.body.appendChild(div);
  return div;
};

// Initialize content script
const init = async () => {
  try {
    // Notify background script
    const response = await Browser.runtime.sendMessage({ type: 'INITIALIZE' });
    console.log('Initialization response:', response);

    // Create and render root element
    const rootContainer = createRootElement();
    const root = createRoot(rootContainer);
    
    root.render(
      <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Prompetize Loaded
        </div>
      </div>
    );

  } catch (error) {
    console.error('Content script initialization error:', error);
  }
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from background script
Browser.runtime.onMessage.addListener((message: { type: string; data?: any }) => {
  console.log('Content script received message:', message);
  return true;
});

console.log('Content script loaded');