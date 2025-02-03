import Browser from 'webextension-polyfill';

// Create a new devtools panel
Browser.devtools.panels
  .create(
    'Prompetize',
    'icon-32.png',
    'src/pages/panel/index.html'
  )
  .then((panel) => {
    // Panel created successfully
    console.log('Devtools panel created');

    // Listen for panel showing/hiding
    panel.onShown.addListener((window) => {
      console.log('Panel shown');
    });

    panel.onHidden.addListener(() => {
      console.log('Panel hidden');
    });
  })
  .catch((error) => {
    console.error('Failed to create devtools panel:', error);
  });

// Initialize connection to background script
const backgroundConnection = Browser.runtime.connect({
  name: 'devtools',
});

// Listen for messages from the background script
backgroundConnection.onMessage.addListener((message) => {
  console.log('Received message in devtools:', message);
});

// Handle connection errors
backgroundConnection.onDisconnect.addListener(() => {
  console.log('Disconnected from background script');
});

console.log('Devtools script loaded');