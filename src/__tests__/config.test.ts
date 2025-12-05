import { DEFAULT_CONFIG } from '../config';

describe('DEFAULT_CONFIG', () => {
  it('should have enabled set to true', () => {
    expect(DEFAULT_CONFIG.enabled).toBe(true);
  });

  it('should have default hotkey set to Shift+Cmd+L', () => {
    expect(DEFAULT_CONFIG.hotkey).toBe('Shift+Cmd+L');
  });

  it('should have correct structure', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('enabled');
    expect(DEFAULT_CONFIG).toHaveProperty('hotkey');
  });
});
