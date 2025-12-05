/**
 * Global type definitions for the renderer process
 */

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
  getConfig(): Promise<AppConfig>;
  saveConfig(config: AppConfig): Promise<ConfigResult>;
  convertText(text: string): Promise<string>;
  pasteConverted(text: string): Promise<ConvertResult>;
  quitApp(): Promise<ConfigResult>;
}

declare global {
  interface Window {
    appAPI: AppAPI;
  }
}

export {};
