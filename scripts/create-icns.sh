#!/bin/bash
# Create an .icns file from a single PNG using sips and iconutil (macOS only)
# Usage: ./scripts/create-icns.sh assets/tray-icon.png assets/app-icon.icns

set -e

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <source-png> <output-icns>"
  exit 1
fi

SRC_PNG="$1"
OUT_ICNS="$2"
ICONSET_DIR="${OUT_ICNS%.icns}.iconset"

if [ ! -f "$SRC_PNG" ]; then
  echo "Source PNG not found: $SRC_PNG"
  exit 2
fi

rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Create icon sizes required for macOS .icns
# sizes: 16,32,128,256,512,1024 with @2x variants
sips -z 16 16     "$SRC_PNG" --out "$ICONSET_DIR/icon_16x16.png"
sips -z 32 32     "$SRC_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
sips -z 32 32     "$SRC_PNG" --out "$ICONSET_DIR/icon_32x32.png"
sips -z 64 64     "$SRC_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
sips -z 128 128   "$SRC_PNG" --out "$ICONSET_DIR/icon_128x128.png"
sips -z 256 256   "$SRC_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
sips -z 256 256   "$SRC_PNG" --out "$ICONSET_DIR/icon_256x256.png"
sips -z 512 512   "$SRC_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
sips -z 512 512   "$SRC_PNG" --out "$ICONSET_DIR/icon_512x512.png"
sips -z 1024 1024 "$SRC_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png"

# Build .icns
iconutil -c icns "$ICONSET_DIR" -o "$OUT_ICNS"

# Clean up
rm -rf "$ICONSET_DIR"

echo "Created $OUT_ICNS"
