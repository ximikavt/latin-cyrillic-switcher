import { convertText } from '../converter';

describe('convertText', () => {
  it('should convert Latin text to Cyrillic', () => {
    const result = convertText('privet');
    expect(result).toBe('зкшмуе');
  });

  it('should convert Cyrillic text to Latin', () => {
    const result = convertText('зкшмуе');
    expect(result).toBe('privet');
  });

  it('should handle mixed case', () => {
    const result = convertText('Hello');
    expect(result).toBe('Руддщ');
  });

  it('should preserve spaces and special characters', () => {
    const result = convertText('hello world!');
    expect(result).toBe('руддщ цщкдв!');
  });

  it('should handle empty string', () => {
    const result = convertText('');
    expect(result).toBe('');
  });
});
