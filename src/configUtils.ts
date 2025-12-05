/**
 * Utility functions for configuration management
 */

import { AppConfig } from './types';
import { DEFAULT_CONFIG } from './config';

/**
 * Merge stored configuration with defaults
 * Ensures all required config properties have values
 */
export function mergeConfigWithDefaults(
  stored: Partial<AppConfig>
): AppConfig {
  return {
    enabled: stored.enabled ?? DEFAULT_CONFIG.enabled,
    hotkey: stored.hotkey ?? DEFAULT_CONFIG.hotkey,
  };
}

/**
 * Validate hotkey string
 * Returns true if hotkey is valid (non-empty after trimming)
 */
export function validateHotkey(hotkey: string): boolean {
  return hotkey.trim().length > 0;
}

/**
 * Validate configuration object
 * Returns error message if invalid, null if valid
 */
export function validateConfig(config: AppConfig): string | null {
  if (!validateHotkey(config.hotkey)) {
    return 'Please enter a hotkey combination';
  }
  return null;
}
