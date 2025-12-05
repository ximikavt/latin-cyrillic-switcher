import { latinToCyrillic, cyrillicToLatin } from '../charMaps';

describe('latinToCyrillic', () => {
  it('should map basic Latin letters to Cyrillic', () => {
    expect(latinToCyrillic['a']).toBe('ф');
    expect(latinToCyrillic['b']).toBe('и');
    expect(latinToCyrillic['c']).toBe('с');
  });

  it('should map uppercase Latin letters to Cyrillic', () => {
    expect(latinToCyrillic['A']).toBe('Ф');
    expect(latinToCyrillic['B']).toBe('И');
    expect(latinToCyrillic['C']).toBe('С');
  });

  it('should map special characters', () => {
    expect(latinToCyrillic['`']).toBe('ґ');
    expect(latinToCyrillic['~']).toBe('Ґ');
    expect(latinToCyrillic['@']).toBe('"');
  });

  it('should be a non-empty object', () => {
    expect(Object.keys(latinToCyrillic).length).toBeGreaterThan(0);
  });
});

describe('cyrillicToLatin', () => {
  it('should map basic Cyrillic letters to Latin', () => {
    expect(cyrillicToLatin['ф']).toBe('a');
    expect(cyrillicToLatin['и']).toBe('b');
    expect(cyrillicToLatin['с']).toBe('c');
  });

  it('should map uppercase Cyrillic letters to Latin', () => {
    expect(cyrillicToLatin['Ф']).toBe('A');
    expect(cyrillicToLatin['И']).toBe('B');
    expect(cyrillicToLatin['С']).toBe('C');
  });

  it('should be the inverse of latinToCyrillic for most mappings', () => {
    // Check that most latinToCyrillic mappings have a reverse in cyrillicToLatin
    // Note: Some Cyrillic characters may map to multiple Latin characters
    let matches = 0;
    const total = Object.keys(latinToCyrillic).length;

    Object.entries(latinToCyrillic).forEach(([latin, cyrillic]) => {
      if (cyrillicToLatin[cyrillic] === latin) {
        matches++;
      }
    });

    // Expect at least 95% of mappings to be bidirectional
    expect(matches / total).toBeGreaterThanOrEqual(0.95);
  });

  it('should be a non-empty object', () => {
    expect(Object.keys(cyrillicToLatin).length).toBeGreaterThan(0);
  });

  it('should have similar size to latinToCyrillic (accounting for potential duplicates)', () => {
    const latinSize = Object.keys(latinToCyrillic).length;
    const cyrillicSize = Object.keys(cyrillicToLatin).length;
    // Allow for slight difference if there are duplicate mappings
    expect(cyrillicSize).toBeGreaterThan(0);
    expect(Math.abs(latinSize - cyrillicSize)).toBeLessThanOrEqual(1);
  });
});
