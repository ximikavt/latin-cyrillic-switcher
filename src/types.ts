/**
 * Configuration types
 */

export type AppConfig = {
  enabled: boolean;
  hotkey: string;
};

export interface ConvertResult {
  success: boolean;
  converted?: string;
}

export interface ConfigResult {
  success: boolean;
}
