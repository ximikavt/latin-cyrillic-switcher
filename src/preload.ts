import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
interface AppConfig {
  enabled: boolean;
  hotkey: string;
}

interface ConfigResult {
  success: boolean;
}

interface ConvertResult {
  success: boolean;
  converted?: string;
}

interface AppAPI {
  getConfig: () => Promise<AppConfig>;
  saveConfig: (config: AppConfig) => Promise<ConfigResult>;
  convertText: (text: string) => Promise<string>;
  pasteConverted: (text: string) => Promise<ConvertResult>;
  quitApp: () => Promise<ConfigResult>;
}

// Expose controlled API to renderer process
const appAPI: AppAPI = {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: AppConfig) => ipcRenderer.invoke('save-config', config),
  convertText: (text: string) => ipcRenderer.invoke('convert-text', text),
  pasteConverted: (text: string) => ipcRenderer.invoke('paste-converted', text),
  quitApp: () => ipcRenderer.invoke('quit-app'),
};

contextBridge.exposeInMainWorld('appAPI', appAPI);

// Type augmentation for window object
declare global {
  interface Window {
    appAPI: AppAPI;
  }
}
