/**
 * Text conversion utilities
 */

import { latinToCyrillic, cyrillicToLatin } from './charMaps';

/**
 * Convert text between Latin and Cyrillic
 */
export function convertText(text: string): string {
  return text
    .split('')
    .map((char: string): string => {
      if (latinToCyrillic[char]) {
        return latinToCyrillic[char];
      } else if (cyrillicToLatin[char]) {
        return cyrillicToLatin[char];
      }
      return char;
    })
    .join('');
}
