#!/usr/bin/env bash

# Verify build artifacts and report bundle sizes
# Usage: ./verify-build.sh [dist_directory]

set -euo pipefail

DIST_DIR="${1:-dist}"

echo "🔍 Verifying build artifacts in: $DIST_DIR"

# Check if dist directory exists and is not empty
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR")" ]; then
  echo "❌ $DIST_DIR/ is empty or doesn't exist"
  exit 1
fi

# Define required files
required_files=("index.js" "index.cjs" "index.umd.js" "index.d.ts")
missing=0

echo "📋 Checking required files:"
for file in "${required_files[@]}"; do
  if [ ! -f "$DIST_DIR/$file" ]; then
    echo "❌ Required file $DIST_DIR/$file is missing"
    missing=1
  else
    size=$(stat -c%s "$DIST_DIR/$file")
    echo "✅ $DIST_DIR/$file (${size} bytes)"
  fi
done

if [ $missing -eq 1 ]; then
  echo "❌ Build verification failed - missing required files"
  exit 1
fi

# Report bundle sizes
echo ""
echo "📦 Bundle Size Report:"
echo "====================="

for file in "${required_files[@]}"; do
  if [[ "$file" == *.d.ts ]]; then
    continue  # Skip type definition files for size reporting
  fi
  
  if [ -f "$DIST_DIR/$file" ]; then
    size=$(stat -c%s "$DIST_DIR/$file")
    kb=$(awk "BEGIN {printf \"%.2f\", $size/1024}")
    
    # Calculate gzipped size
    gzip_size=$(gzip -c "$DIST_DIR/$file" | wc -c)
    gzip_kb=$(awk "BEGIN {printf \"%.2f\", $gzip_size/1024}")
    
    # Determine format name
    case "$file" in
      "index.js")
        format="ESM"
        ;;
      "index.cjs")
        format="CommonJS"
        ;;
      "index.umd.js")
        format="UMD"
        ;;
      *)
        format="Unknown"
        ;;
    esac
    
    printf "%-15s %8s KB (%6s KB gzipped)\n" "$format ($file):" "$kb" "$gzip_kb"
  fi
done

echo ""
echo "✅ Build verification completed successfully"
