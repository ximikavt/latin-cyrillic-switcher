/**
 * Character mapping between Latin and Cyrillic layouts
 */

export type CharacterMapping = Record<string, string>;

// Latin to Cyrillic mapping
export const latinToCyrillic: CharacterMapping = {
  // Row 1 (top row numbers/symbols)
  '`': 'ґ',
  '~': 'Ґ',
  '!': '!',
  '@': '"',
  '#': '№',
  $: ';',
  '%': '%',
  '^': ':',
  '&': '?',
  '*': '*',
  '(': '(',
  ')': ')',

  // Row 2 (QWERTY row)
  q: 'й',
  w: 'ц',
  e: 'у',
  r: 'к',
  t: 'е',
  y: 'н',
  u: 'г',
  i: 'ш',
  o: 'щ',
  p: 'з',
  '[': 'х',
  ']': 'ї',
  Q: 'Й',
  W: 'Ц',
  E: 'У',
  R: 'К',
  T: 'Е',
  Y: 'Н',
  U: 'Г',
  I: 'Ш',
  O: 'Щ',
  P: 'З',
  '{': 'Х',
  '}': 'Ї',

  // Row 3 (ASDFGH row)
  a: 'ф',
  s: 'і',
  d: 'в',
  f: 'а',
  g: 'п',
  h: 'р',
  j: 'о',
  k: 'л',
  l: 'д',
  ';': 'ж',
  "'": 'є',
  A: 'Ф',
  S: 'І',
  D: 'В',
  F: 'А',
  G: 'П',
  H: 'Р',
  J: 'О',
  K: 'Л',
  L: 'Д',
  ':': 'Ж',
  '"': 'Є',

  // Row 4 (ZXCVBN row)
  z: 'я',
  x: 'ч',
  c: 'с',
  v: 'м',
  b: 'и',
  n: 'т',
  m: 'ь',
  ',': 'б',
  '.': 'ю',
  '/': '.',
  Z: 'Я',
  X: 'Ч',
  C: 'С',
  V: 'М',
  B: 'И',
  N: 'Т',
  M: 'Ь',
  '<': 'Б',
  '>': 'Ю',
  '?': '.',

  // Special characters
  '\\': '\\',
  '|': '|',
};

// Create reverse mapping for Cyrillic to Latin
export const cyrillicToLatin: CharacterMapping = {};
Object.entries(latinToCyrillic).forEach(([latin, cyrillic]: [string, string]) => {
  cyrillicToLatin[cyrillic] = latin;
});
