import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  clipboard,
  Tray,
  globalShortcut,
  IpcMainInvokeEvent,
  nativeImage,
} from 'electron';
import path from 'path';
import Store from 'electron-store';
import { execSync } from 'child_process';

// Type definitions
interface AppConfig {
  enabled: boolean;
  hotkey: string;
}

interface ConvertResult {
  success: boolean;
  converted?: string;
}

interface ConfigResult {
  success: boolean;
}

// Character mapping types
type CharacterMapping = Record<string, string>;

// Store configuration
const store = new Store<AppConfig>({
  defaults: {
    enabled: true,
    hotkey: 'Shift+Cmd+L',
  },
});

// Latin to Cyrillic mapping
const latinToCyrillic: CharacterMapping = {
  // Row 1 (top row numbers/symbols)
  '`': 'ґ',
  '~': 'Ґ',
  '!': '!',
  '@': '"',
  '#': '№',
  '$': ';',
  '%': '%',
  '^': ':',
  '&': '?',
  '*': '*',
  '(': '(',
  ')': ')',

  // Row 2 (QWERTY row)
  q: 'й',
  w: 'ц',
  e: 'у',
  r: 'к',
  t: 'е',
  y: 'н',
  u: 'г',
  i: 'ш',
  o: 'щ',
  p: 'з',
  '[': 'х',
  ']': 'ї',
  Q: 'Й',
  W: 'Ц',
  E: 'У',
  R: 'К',
  T: 'Е',
  Y: 'Н',
  U: 'Г',
  I: 'Ш',
  O: 'Щ',
  P: 'З',
  '{': 'Х',
  '}': 'Ї',

  // Row 3 (ASDFGH row)
  a: 'ф',
  s: 'і',
  d: 'в',
  f: 'а',
  g: 'п',
  h: 'р',
  j: 'о',
  k: 'л',
  l: 'д',
  ';': 'ж',
  "'": 'є',
  A: 'Ф',
  S: 'І',
  D: 'В',
  F: 'А',
  G: 'П',
  H: 'Р',
  J: 'О',
  K: 'Л',
  L: 'Д',
  ':': 'Ж',
  '"': 'Є',

  // Row 4 (ZXCVBN row)
  z: 'я',
  x: 'ч',
  c: 'с',
  v: 'м',
  b: 'и',
  n: 'т',
  m: 'ь',
  ',': 'б',
  '.': 'ю',
  '/': '.',
  Z: 'Я',
  X: 'Ч',
  C: 'С',
  V: 'М',
  B: 'И',
  N: 'Т',
  M: 'Ь',
  '<': 'Б',
  '>': 'Ю',
  '?': '.',

  // Special characters
  '\\': '\\',
  '|': '|',
};

// Create reverse mapping for Cyrillic to Latin
const cyrillicToLatin: CharacterMapping = {};
Object.entries(latinToCyrillic).forEach(([latin, cyrillic]: [string, string]) => {
  cyrillicToLatin[cyrillic] = latin;
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

/**
 * Convert text between Latin and Cyrillic
 */
function convertText(text: string): string {
  return text
    .split('')
    .map((char: string): string => {
      if (latinToCyrillic[char]) {
        return latinToCyrillic[char];
      } else if (cyrillicToLatin[char]) {
        return cyrillicToLatin[char];
      }
      return char;
    })
    .join('');
}

/**
 * Get selected text from active application using AppleScript
 */
function getSelectedText(): string {
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

    const result: string = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8',
    });
    return result;
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

/**
 * Set clipboard and paste
 */
function pasteText(text: string): void {
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

/**
 * Handle hotkey action
 */
function handleHotkey(): void {
  const config = store.store as AppConfig;
  if (!config.enabled) return;

  const selectedText: string = getSelectedText().trim();
  if (!selectedText) return;

  const converted: string = convertText(selectedText);
  pasteText(converted);
}

/**
 * Register global hotkey
 */
function registerHotkey(hotkey: string): void {
  try {
    // Unregister all previous shortcuts
    globalShortcut.unregisterAll();

    // Register the new hotkey
    const registered: boolean = globalShortcut.register(hotkey, (): void => {
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

/**
 * Create configuration window
 */
const createConfigWindow = (): void => {
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
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
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

/**
 * Position popover below tray icon
 */
const showPopover = (): void => {
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
    const x: number = Math.round(trayBounds.x + trayBounds.width / 2 - windowWidth / 2);
    const y: number = Math.round(trayBounds.y + trayBounds.height + 5);
    mainWindow.setPosition(x, y);
  }
};

/**
 * Create menu bar icon
 */
const createTray = (): void => {
  const iconPath: string = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  // Resize to standard macOS menubar size (22x22)
  const resized = icon.resize({ width: 22, height: 22 });
  // Set as template for dark theme support
  resized.setTemplateImage(true);
  tray = new Tray(resized);

  // Click tray icon to show popover
  tray.on('click', () => {
    showPopover();
  });

  // Right-click for context menu
  const contextMenu = Menu.buildFromTemplate([]);
  tray.setContextMenu(contextMenu);
  tray.setIgnoreDoubleClickEvents(true);
};

// App event listeners
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
  const config = store.store as AppConfig;
  registerHotkey(config.hotkey);
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
ipcMain.handle('get-config', async (_event: IpcMainInvokeEvent): Promise<AppConfig> => {
  const config = store.store as AppConfig;
  return {
    enabled: config.enabled,
    hotkey: config.hotkey,
  };
});

ipcMain.handle(
  'save-config',
  async (_event: IpcMainInvokeEvent, config: AppConfig): Promise<ConfigResult> => {
    const oldHotkey: string = (store.store as AppConfig).hotkey;

    store.set('enabled', config.enabled);
    store.set('hotkey', config.hotkey);

    if (config.hotkey !== oldHotkey) {
      registerHotkey(config.hotkey);
    }

    return { success: true };
  }
);

ipcMain.handle('convert-text', async (_event: IpcMainInvokeEvent, text: string): Promise<string> => {
  return convertText(text);
});

ipcMain.handle(
  'paste-converted',
  async (_event: IpcMainInvokeEvent, text: string): Promise<ConvertResult> => {
    const converted: string = convertText(text);
    clipboard.writeText(converted);
    return { success: true, converted };
  }
);

ipcMain.handle('quit-app', async (_event: IpcMainInvokeEvent): Promise<ConfigResult> => {
  app.quit();
  return { success: true };
});
