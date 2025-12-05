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
import ElectronStore from 'electron-store';

import { AppConfig, ConvertResult, ConfigResult } from './types';
import { convertText } from './converter';
import { getSelectedText, pasteText } from './systemUtils';
import { DEFAULT_CONFIG } from './config';
import { mergeConfigWithDefaults } from './configUtils';

// Store configuration - type assertion needed due to Conf base class type resolution
interface TypedStore<T> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): void;
}

const store = new ElectronStore<AppConfig>({
  defaults: DEFAULT_CONFIG,
}) as ElectronStore<AppConfig> & TypedStore<AppConfig>;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

/**
 * Get current configuration
 */
function getConfig(): AppConfig {
  const enabled = store.get('enabled');
  const hotkey = store.get('hotkey');
  return mergeConfigWithDefaults({ enabled, hotkey });
}

/**
 * Handle hotkey action
 */
function handleHotkey(): void {
  const config = getConfig();
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

    if (!registered) {
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
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

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
  const config = getConfig();
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
ipcMain.handle('get-config', async (): Promise<AppConfig> => {
  return getConfig();
});

ipcMain.handle(
  'save-config',
  async (_event: IpcMainInvokeEvent, config: AppConfig): Promise<ConfigResult> => {
    const currentConfig = getConfig();
    const oldHotkey: string = currentConfig.hotkey;

    // Persist updated config using electron-store
    store.set('enabled', config.enabled);
    store.set('hotkey', config.hotkey);

    if (config.hotkey !== oldHotkey) {
      registerHotkey(config.hotkey);
    }

    return { success: true };
  }
);

ipcMain.handle('convert-text', async (_event, text: string): Promise<string> => {
  return convertText(text);
});

ipcMain.handle('paste-converted', async (_event, text: string): Promise<ConvertResult> => {
  const converted: string = convertText(text);
  clipboard.writeText(converted);
  return { success: true, converted };
});

ipcMain.handle('quit-app', async (): Promise<ConfigResult> => {
  app.quit();
  return { success: true };
});
