# latin-cyrillic-switcher

A macOS Electron menubar app that converts selected text between Latin and Cyrillic layouts using a configured hotkey combination.

## Features

- **Menubar App**: Runs in the background with a small icon in the macOS menu bar
- **Global Hotkey**: Configurable keyboard shortcut to trigger text conversion
- **Bidirectional Conversion**: Automatically converts between Latin and Cyrillic layouts
- **Easy Configuration**: Simple popup window to configure enabled state and hotkey
- **Works in Any App**: Converts text in browsers, messengers, text editors, and other applications

## Installation

### Prerequisites
- macOS 10.13 or later
- Node.js and npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. The app is ready to run!

## Running the App

Start the development version:
```bash
npm start
```

## Building for Production

### Create a DMG installer:
```bash
npm run build:dmg
```

### Create a ZIP archive:
```bash
npm run build:mac
```

The built app will be in the `dist/` directory:
- `latin-cyrillic-switcher.dmg` - Installer for macOS
- `latin-cyrillic-switcher.zip` - Portable app archive

### Notes for Distribution
- The app requires Accessibility permissions to work (users will be prompted on first run)
- Code signing and notarization may be required for distribution outside the App Store
- The app is optimized for macOS 10.13+

## Using the Tray Icon as App Icon

To use the existing tray PNG as the application icon, you can either point the builder at the PNG (already configured), or generate a proper `.icns` file (recommended) on macOS:

1. Make the helper script executable:

```bash
chmod +x ./scripts/create-icns.sh
```

2. Generate an `.icns` from the tray PNG:

```bash
./scripts/create-icns.sh assets/tray-icon.png assets/app-icon.icns
```

3. After generation, the build config already points to `assets/tray-icon.png` as a fallback; if you create `assets/app-icon.icns`, electron-builder will prefer that on macOS.

Note: `iconutil` and `sips` are macOS utilities used by the helper script.

## Configuration

1. Click the "Л↔L" icon in the macOS menu bar at the top
2. Select "Configure" to open the settings popup
3. Enable/disable the converter with the checkbox
4. Enter your preferred hotkey combination (e.g., `Shift+Cmd+L`, `Ctrl+Option+E`)
5. Click "Save Settings"

## How It Works

### Global Hotkey
When you press the configured hotkey combination:
1. The app captures the selected text from the active application
2. Converts it between Latin and Cyrillic layouts
3. Replaces the selected text with the converted version

### Text Mapping

The app uses the following character mappings:

**Lowercase Latin → Cyrillic:**
```
q→й w→ц e→у r→к t→е y→н u→г i→ш o→щ p→з [→х ]→ї
a→ф s→і d→в f→а g→п h→р j→о k→л l→д ;→ж '→є
z→я x→ч c→с v→м b→и n→т m→ь ,→б .→ю /→.
```

**Uppercase Latin → Cyrillic:**
```
Q→Й W→Ц E→У R→К T→Е Y→Н U→Г I→Ш O→Щ P→З {→Х }→Ї
A→Ф S→І D→В F→А G→П H→Р J→О K→Л L→Д :→Ж "→Є
Z→Я X→Ч C→С V→М B→И N→Т M→Ь <→Б >→Ю
```

**Special Characters:**
```
`→ґ ~→Ґ !→! @→" #→№ $→; %→% ^→: &→? *→* (→( )→)
```

## Project Structure

```
/tmp/my-macos-app/
├── main.js           # Main Electron process, hotkey registration, text conversion
├── preload.js        # Preload script for secure IPC communication
├── index.html        # Configuration UI
├── package.json      # Project dependencies and scripts
├── create-icon.py    # Icon generation script
├── assets/
│   └── tray-icon.png # Menubar icon
└── README.md         # This file
```

## Configuration Storage

Settings are automatically saved and persisted in:
```
~/Library/Application Support/latin-cyrillic-switcher/config.json
```
```
/tmp/latin-cyrillic-switcher/
├── main.js           # Main Electron process, hotkey registration, text conversion
├── preload.js        # Preload script for secure IPC communication
├── index.html        # Configuration UI
├── package.json      # Project dependencies and scripts
├── scripts/
│   └── create-icns.sh # Icon generation helper for macOS
├── assets/
│   └── tray-icon.png # Menubar icon
└── README.md         # This file
```
- `Cmd+Option+E`
- `Ctrl+Shift+C`

## Troubleshooting

### Hotkey not working
- Make sure the app has accessibility permissions in System Preferences → Security & Privacy
- Try a different hotkey combination
- Verify the hotkey isn't already registered by another application

### Text not converting
- Check that the converter is enabled in the settings
- Ensure you have text selected before pressing the hotkey
- Try copying the text manually and using the converter

### App not appearing in menu bar
- The app should appear automatically with a "Л↔L" icon
- If not visible, check Activity Monitor to see if the process is running
- Try quitting and restarting the app

## Requirements

The app needs accessibility permissions to:
- Capture selected text from other applications
- Simulate keyboard shortcuts (Cmd+C, Cmd+V)

Grant permissions in **System Preferences → Security & Privacy → Accessibility**

## License

MIT

## Notes

- The app runs entirely in the background and doesn't create a main window
- All configuration is stored locally on your machine
- The converter works across all macOS applications
- Keyboard focus returns to the original application after conversion
