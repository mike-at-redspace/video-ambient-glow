#!/usr/bin/env bash

# Simple performance benchmark for the video-ambient-glow library
# Usage: ./benchmark.sh

set -euo pipefail

echo "⚡ Running performance benchmarks..."

# Ensure we have built artifacts
if [ ! -f "dist/index.js" ]; then
  echo "❌ Build artifacts not found. Run 'npm run build' first."
  exit 1
fi

# Check file sizes
echo ""
echo "📊 File Size Benchmarks:"
echo "========================"

ESM_SIZE=$(stat -c%s dist/index.js)
CJS_SIZE=$(stat -c%s dist/index.cjs)
UMD_SIZE=$(stat -c%s dist/index.umd.js)

echo "ESM bundle: $(awk "BEGIN {printf \"%.2f KB\", $ESM_SIZE/1024}")"
echo "CJS bundle: $(awk "BEGIN {printf \"%.2f KB\", $CJS_SIZE/1024}")"
echo "UMD bundle: $(awk "BEGIN {printf \"%.2f KB\", $UMD_SIZE/1024}")"

# Gzipped sizes
ESM_GZIP=$(gzip -c dist/index.js | wc -c)
CJS_GZIP=$(gzip -c dist/index.cjs | wc -c)
UMD_GZIP=$(gzip -c dist/index.umd.js | wc -c)

echo ""
echo "📦 Gzipped Sizes:"
echo "=================="
echo "ESM bundle: $(awk "BEGIN {printf \"%.2f KB\", $ESM_GZIP/1024}")"
echo "CJS bundle: $(awk "BEGIN {printf \"%.2f KB\", $CJS_GZIP/1024}")"
echo "UMD bundle: $(awk "BEGIN {printf \"%.2f KB\", $UMD_GZIP/1024}")"

# Size limits (warning thresholds)
MAX_ESM_KB=20
MAX_GZIP_KB=10

ESM_KB=$(awk "BEGIN {print $ESM_SIZE/1024}")
GZIP_KB=$(awk "BEGIN {print $ESM_GZIP/1024}")

echo ""
echo "🎯 Performance Metrics:"
echo "======================="

if (( $(awk "BEGIN {print $ESM_KB > $MAX_ESM_KB}") )); then
  echo "⚠️  ESM bundle size (${ESM_KB} KB) exceeds recommended limit (${MAX_ESM_KB} KB)"
else
  echo "✅ ESM bundle size within limits"
fi

if (( $(awk "BEGIN {print $GZIP_KB > $MAX_GZIP_KB}") )); then
  echo "⚠️  Gzipped size (${GZIP_KB} KB) exceeds recommended limit (${MAX_GZIP_KB} KB)"
else
  echo "✅ Gzipped size within limits"
fi

# Check if TypeScript types are available
if [ -f "dist/index.d.ts" ]; then
  TYPES_SIZE=$(stat -c%s dist/index.d.ts)
  echo "✅ TypeScript types available ($(awk "BEGIN {printf \"%.2f KB\", $TYPES_SIZE/1024}") KB)"
else
  echo "❌ TypeScript types missing"
fi

echo ""
echo "🏁 Benchmark completed successfully"

# Output summary for GitHub Actions
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "## ⚡ Performance Benchmark Results"
    echo ""
    echo "| Format | Raw Size | Gzipped |"
    echo "|--------|----------|---------|"
    echo "| ESM | $(awk "BEGIN {printf \"%.2f KB\", $ESM_SIZE/1024}") | $(awk "BEGIN {printf \"%.2f KB\", $ESM_GZIP/1024}") |"
    echo "| CJS | $(awk "BEGIN {printf \"%.2f KB\", $CJS_SIZE/1024}") | $(awk "BEGIN {printf \"%.2f KB\", $CJS_GZIP/1024}") |"
    echo "| UMD | $(awk "BEGIN {printf \"%.2f KB\", $UMD_SIZE/1024}") | $(awk "BEGIN {printf \"%.2f KB\", $UMD_GZIP/1024}") |"
    echo ""
    
    if (( $(awk "BEGIN {print $ESM_KB > $MAX_ESM_KB}") )) || (( $(awk "BEGIN {print $GZIP_KB > $MAX_GZIP_KB}") )); then
      echo "⚠️ **Warning:** Bundle size exceeds recommended limits"
    else
      echo "✅ **Success:** All bundle sizes within recommended limits"
    fi
  } >> "$GITHUB_STEP_SUMMARY"
fi
