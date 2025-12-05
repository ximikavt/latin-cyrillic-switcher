/**
 * System utilities for clipboard and AppleScript operations
 */

import { clipboard } from 'electron';
import { execSync } from 'child_process';

/**
 * Get selected text from active application using AppleScript
 */
export function getSelectedText(): string {
  try {
    const script = `
      tell application "System Events"
        keystroke "c" using command down
        delay 0.1
      end tell
      
      tell application "System Events"
        get the clipboard
      end tell
    `;

    const result: string = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8',
    });
    return result;
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

/**
 * Set clipboard and paste
 */
export function pasteText(text: string): void {
  try {
    clipboard.writeText(text);

    const script = `
      tell application "System Events"
        keystroke "v" using command down
      end tell
    `;

    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
  } catch (error) {
    console.error('Error pasting text:', error);
  }
}
