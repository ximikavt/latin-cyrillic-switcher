/**
 * Configuration types and defaults
 */

export interface AppConfig {
  enabled: boolean;
  hotkey: string;
}

export interface ConvertResult {
  success: boolean;
  converted?: string;
}

export interface ConfigResult {
  success: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  enabled: true,
  hotkey: 'Shift+Cmd+L',
};
