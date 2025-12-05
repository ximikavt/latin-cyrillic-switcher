const { app, BrowserWindow, Menu, ipcMain, clipboard, Tray, globalShortcut } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { execSync } = require('child_process');

const store = new Store({
  defaults: {
    enabled: true,
    hotkey: 'Shift+Cmd+L'
  }
});

// Latin to Cyrillic mapping
const latinToCyrillic = {
  // Row 1 (top row numbers/symbols)
  '`': 'ґ', '~': 'Ґ', '!': '!', '@': '"', '#': '№', '$': ';', '%': '%', '^': ':', '&': '?', '*': '*', '(': '(', ')': ')',

  // Row 2 (QWERTY row)
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ї',
  'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З', '{': 'Х', '}': 'Ї',

  // Row 3 (ASDFGH row)
  'a': 'ф', 's': 'і', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'є',
  'A': 'Ф', 'S': 'І', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л', 'L': 'Д', ':': 'Ж', '"': 'Є',

  // Row 4 (ZXCVBN row)
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '/': '.',
  'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т', 'M': 'Ь', '<': 'Б', '>': 'Ю', '?': '.',

  // Special characters
  '\\': '\\', '|': '|'
};

// Create reverse mapping for Cyrillic to Latin
const cyrillicToLatin = {};
Object.entries(latinToCyrillic).forEach(([latin, cyrillic]) => {
  cyrillicToLatin[cyrillic] = latin;
});

let mainWindow;
let tray;

// Text conversion function
function convertText(text) {
  return text.split('').map(char => {
    if (latinToCyrillic[char]) {
      return latinToCyrillic[char];
    } else if (cyrillicToLatin[char]) {
      return cyrillicToLatin[char];
    }
    return char;
  }).join('');
}

// Get selected text from active application using AppleScript
function getSelectedText() {
  try {
    const script = `
      tell application "System Events"
        keystroke "c" using command down
        delay 0.1
      end tell
      
      tell application "System Events"
        get the clipboard
      end tell
    `;

    const result = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
    return result;
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

// Set clipboard and paste
function pasteText(text) {
  try {
    clipboard.writeText(text);

    const script = `
      tell application "System Events"
        keystroke "v" using command down
      end tell
    `;

    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
  } catch (error) {
    console.error('Error pasting text:', error);
  }
}

// Handle hotkey action
function handleHotkey() {
  const config = store.get();
  if (!config.enabled) return;

  const selectedText = getSelectedText().trim();
  if (!selectedText) return;

  const converted = convertText(selectedText);
  pasteText(converted);
}

// Register global hotkey
function registerHotkey(hotkey) {
  try {
    // Unregister all previous shortcuts
    globalShortcut.unregisterAll();

    // Register the new hotkey
    const registered = globalShortcut.register(hotkey, () => {
      handleHotkey();
    });

    if (registered) {
      console.log('Hotkey registered:', hotkey);
    } else {
      console.error('Failed to register hotkey:', hotkey);
    }
  } catch (error) {
    console.error('Error registering hotkey:', error);
  }
}

const createConfigWindow = () => {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 320,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Position popover below tray icon
const showPopover = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createConfigWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }

  // Position below the tray icon
  if (mainWindow && tray) {
    const trayBounds = tray.getBounds();
    const windowWidth = 360;
    const windowHeight = 320;
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowWidth / 2);
    const y = Math.round(trayBounds.y + trayBounds.height + 5);
    mainWindow.setPosition(x, y);
  }
};

// Create menu bar icon
const createTray = () => {
  // Create tray with simple icon
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  const icon = require('electron').nativeImage.createFromPath(iconPath);
  // Resize to standard macOS menubar size (22x22)
  const resized = icon.resize({ width: 22, height: 22 });
  // Set as template for dark theme support
  resized.setTemplateImage(true);
  tray = new Tray(resized);

  // Click tray icon to show popover
  tray.on('click', () => {
    showPopover();
  });

  // Right-click for context menu (empty, just for future use)
  const contextMenu = Menu.buildFromTemplate([]);
  tray.setContextMenu(contextMenu);
  tray.setIgnoreDoubleClickEvents(true);
};

app.on('ready', () => {
  // On macOS hide Dock icon so the app is menubar-only
  if (process.platform === 'darwin' && app.dock && typeof app.dock.hide === 'function') {
    try {
      app.dock.hide();
    } catch (err) {
      console.warn('Unable to hide Dock icon:', err);
    }
  }

  // Create system tray/menubar icon
  createTray();

  // Register initial hotkey
  registerHotkey(store.get('hotkey'));
});

app.on('window-all-closed', () => {
  // Don't quit on macOS when all windows closed - keep running in background
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS, re-creating a window in the app when dock icon is clicked
  if (mainWindow === null) {
    // Don't auto-create, keep background only
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// IPC handlers for configuration
ipcMain.handle('get-config', () => {
  return {
    enabled: store.get('enabled'),
    hotkey: store.get('hotkey')
  };
});

ipcMain.handle('save-config', (event, config) => {
  const oldHotkey = store.get('hotkey');

  store.set('enabled', config.enabled);
  store.set('hotkey', config.hotkey);

  if (config.hotkey !== oldHotkey) {
    registerHotkey(config.hotkey);
  }

  return { success: true };
});

ipcMain.handle('convert-text', (event, text) => {
  return convertText(text);
});

ipcMain.handle('paste-converted', async (event, text) => {
  const converted = convertText(text);
  clipboard.writeText(converted);
  return { success: true, converted };
});

ipcMain.handle('quit-app', () => {
  app.quit();
  return { success: true };
});
