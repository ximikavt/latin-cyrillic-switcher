import { contextBridge, ipcRenderer } from 'electron';

import { AppConfig } from './types';

// Expose controlled API to renderer process
const appAPI = {
  getConfig: () => {
    console.log('[Preload] getConfig called');
    return ipcRenderer.invoke('get-config');
  },
  saveConfig: (config: AppConfig) => {
    console.log('[Preload] saveConfig called with:', config);
    return ipcRenderer.invoke('save-config', config);
  },
  convertText: (text: string) => ipcRenderer.invoke('convert-text', text),
  pasteConverted: (text: string) => ipcRenderer.invoke('paste-converted', text),
  quitApp: () => {
    console.log('[Preload] quitApp called');
    return ipcRenderer.invoke('quit-app');
  },
};

console.log('[Preload] Exposing appAPI to main world');
contextBridge.exposeInMainWorld('appAPI', appAPI);

// Type augmentation for window object
declare global {
  interface Window {
    appAPI: typeof appAPI;
  }
}
