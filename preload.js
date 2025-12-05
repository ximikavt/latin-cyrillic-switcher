const { contextBridge, ipcRenderer } = require('electron');

// Expose controlled API to renderer process
contextBridge.exposeInMainWorld('appAPI', {
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    convertText: (text) => ipcRenderer.invoke('convert-text', text),
    pasteConverted: (text) => ipcRenderer.invoke('paste-converted', text),
    quitApp: () => ipcRenderer.invoke('quit-app')
});
