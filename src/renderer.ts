/**
 * Main application UI controller
 * Handles configuration loading, saving, and app control
 */

// DOM elements
const form = document.getElementById('configForm') as HTMLFormElement;
const enabledCheckbox = document.getElementById('enabledCheckbox') as HTMLInputElement;
const hotkeyInput = document.getElementById('hotkeyInput') as HTMLInputElement;
const quitBtn = document.getElementById('quitBtn') as HTMLButtonElement;
const statusMessage = document.getElementById('statusMessage') as HTMLDivElement;

// Debug: Check if appAPI is available
console.log('window.appAPI available:', typeof window.appAPI);

/**
 * Wait for appAPI to be injected by the preload script
 */
function waitForAppAPI(): Promise<typeof window.appAPI> {
  return new Promise((resolve) => {
    if (typeof window.appAPI !== 'undefined') {
      resolve(window.appAPI);
      return;
    }
    
    // Wait for appAPI to be injected
    const checkInterval = setInterval((): void => {
      if (typeof window.appAPI !== 'undefined') {
        clearInterval(checkInterval);
        console.log('appAPI became available');
        resolve(window.appAPI);
      }
    }, 50);
    
    // Timeout after 5 seconds
    setTimeout((): void => {
      clearInterval(checkInterval);
      console.error('appAPI not available after 5 seconds');
    }, 5000);
  });
}

/**
 * Load configuration from main process
 */
async function loadConfig(): Promise<void> {
  try {
    const api = await waitForAppAPI();
    console.log('Loading config...');
    const config = await api.getConfig();
    console.log('Config loaded:', config);
    enabledCheckbox.checked = config.enabled;
    hotkeyInput.value = config.hotkey;
  } catch (error) {
    console.error('Error loading config:', error);
    showStatus('Error loading configuration', 'error');
  }
}

/**
 * Show status message to user
 */
function showStatus(message: string, type: 'success' | 'error'): void {
  console.log('Status [' + type + ']: ' + message);
  statusMessage.textContent = message;
  statusMessage.className = 'status-message status-' + type;
}

/**
 * Handle form submission to save configuration
 */
async function handleFormSubmit(e: Event): Promise<void> {
  e.preventDefault();

  try {
    const api = await waitForAppAPI();
    const config = {
      enabled: enabledCheckbox.checked,
      hotkey: hotkeyInput.value.trim()
    };

    if (!config.hotkey) {
      showStatus('Please enter a hotkey combination', 'error');
      return;
    }

    console.log('Saving config:', config);
    await api.saveConfig(config);
    showStatus('Settings saved successfully!', 'success');

    setTimeout((): void => {
      window.close();
    }, 1500);
  } catch (error) {
    console.error('Error saving config:', error);
    showStatus('Error saving configuration', 'error');
  }
}

/**
 * Handle quit button click
 */
async function handleQuitClick(): Promise<void> {
  try {
    const api = await waitForAppAPI();
    console.log('Quitting app...');
    await api.quitApp();
  } catch (error) {
    console.error('Error quitting app:', error);
  }
}

/**
 * Initialize the application when DOM is ready
 */
function initialize(): void {
  console.log('Initializing application...');
  
  // Set up event listeners
  form.addEventListener('submit', (e: Event) => handleFormSubmit(e));
  quitBtn.addEventListener('click', () => handleQuitClick());
  
  // Load initial configuration
  loadConfig();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', (): void => initialize());
} else {
  console.log('DOM already loaded, initializing...');
  initialize();
}
