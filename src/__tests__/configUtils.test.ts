import {
  mergeConfigWithDefaults,
  validateHotkey,
  validateConfig,
} from '../configUtils';

describe('mergeConfigWithDefaults', () => {
  it('should use stored values when provided', () => {
    const stored = { enabled: false, hotkey: 'Ctrl+Alt+X' };
    const result = mergeConfigWithDefaults(stored);
    expect(result.enabled).toBe(false);
    expect(result.hotkey).toBe('Ctrl+Alt+X');
  });

  it('should use defaults when stored values are missing', () => {
    const stored = {};
    const result = mergeConfigWithDefaults(stored);
    expect(result.enabled).toBe(true);
    expect(result.hotkey).toBe('Shift+Cmd+L');
  });

  it('should merge partial config with defaults', () => {
    const stored = { enabled: false };
    const result = mergeConfigWithDefaults(stored);
    expect(result.enabled).toBe(false);
    expect(result.hotkey).toBe('Shift+Cmd+L');
  });

  it('should use defaults for null values', () => {
    const stored = { enabled: undefined, hotkey: undefined };
    const result = mergeConfigWithDefaults(stored);
    expect(result.enabled).toBe(true);
    expect(result.hotkey).toBe('Shift+Cmd+L');
  });
});

describe('validateHotkey', () => {
  it('should return true for valid hotkey', () => {
    expect(validateHotkey('Shift+Cmd+L')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(validateHotkey('')).toBe(false);
  });

  it('should return false for whitespace only', () => {
    expect(validateHotkey('   ')).toBe(false);
  });

  it('should return true for hotkey with surrounding whitespace', () => {
    expect(validateHotkey('  Ctrl+X  ')).toBe(true);
  });
});

describe('validateConfig', () => {
  it('should return null for valid config', () => {
    const config = { enabled: true, hotkey: 'Shift+Cmd+L' };
    expect(validateConfig(config)).toBeNull();
  });

  it('should return error message for empty hotkey', () => {
    const config = { enabled: true, hotkey: '' };
    const error = validateConfig(config);
    expect(error).toBe('Please enter a hotkey combination');
  });

  it('should return error message for whitespace-only hotkey', () => {
    const config = { enabled: true, hotkey: '   ' };
    const error = validateConfig(config);
    expect(error).toBe('Please enter a hotkey combination');
  });

  it('should validate regardless of enabled state', () => {
    const config = { enabled: false, hotkey: 'Ctrl+X' };
    expect(validateConfig(config)).toBeNull();
  });
});
