#!/usr/bin/env bash

# Compare bundle sizes between base branch and current PR
# Usage: ./compare-bundle-sizes.sh <base_ref> <current_sha>

set -euo pipefail

BASE_REF="${1:-main}"
CURRENT_SHA="${2:-HEAD}"

echo "📊 Analyzing bundle size changes..."
echo "Base: $BASE_REF"
echo "Current: $CURRENT_SHA"

# Store current state
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
STASH_CREATED=false

# Stash any uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "💾 Stashing uncommitted changes..."
  git stash push -m "bundle-comparison-temp-stash" >/dev/null 2>&1
  STASH_CREATED=true
fi

cleanup() {
  echo "🧹 Cleaning up..."
  
  # Return to original branch/commit
  if [ "$CURRENT_BRANCH" != "HEAD" ]; then
    git checkout "$CURRENT_BRANCH" >/dev/null 2>&1 || git checkout "$CURRENT_SHA" >/dev/null 2>&1
  else
    git checkout "$CURRENT_SHA" >/dev/null 2>&1
  fi
  
  # Restore stashed changes
  if [ "$STASH_CREATED" = true ]; then
    echo "📦 Restoring stashed changes..."
    git stash pop >/dev/null 2>&1 || echo "⚠️ Could not restore stash"
  fi
}

trap cleanup EXIT

# Get base branch sizes
echo "🔄 Building base branch ($BASE_REF)..."
git fetch origin "$BASE_REF" >/dev/null 2>&1
git checkout "origin/$BASE_REF" >/dev/null 2>&1

npm ci --prefer-offline --no-audit >/dev/null 2>&1
npm run build >/dev/null 2>&1

if [ ! -f "dist/index.js" ]; then
  echo "❌ Base build failed - dist/index.js not found"
  exit 1
fi

BASE_ESM=$(stat -c%s dist/index.js)
BASE_CJS=$(stat -c%s dist/index.cjs)
BASE_UMD=$(stat -c%s dist/index.umd.js)

echo "✅ Base sizes recorded"

# Get PR sizes
echo "🔄 Building current changes ($CURRENT_SHA)..."
git checkout "$CURRENT_SHA" >/dev/null 2>&1

npm ci --prefer-offline --no-audit >/dev/null 2>&1
npm run build >/dev/null 2>&1

if [ ! -f "dist/index.js" ]; then
  echo "❌ Current build failed - dist/index.js not found"
  exit 1
fi

PR_ESM=$(stat -c%s dist/index.js)
PR_CJS=$(stat -c%s dist/index.cjs)
PR_UMD=$(stat -c%s dist/index.umd.js)

echo "✅ Current sizes recorded"

# Calculate differences
ESM_DIFF=$((PR_ESM - BASE_ESM))
CJS_DIFF=$((PR_CJS - BASE_CJS))
UMD_DIFF=$((PR_UMD - BASE_UMD))

# Format sizes
format_size() {
  local size=$1
  awk "BEGIN {printf \"%.1f KB\", $size/1024}"
}

format_diff() {
  local diff=$1
  if [ "$diff" -gt 0 ]; then
    echo "+${diff} bytes"
  elif [ "$diff" -lt 0 ]; then
    echo "${diff} bytes"
  else
    echo "no change"
  fi
}

# Generate summary for GitHub Step Summary
{
  echo "## 📊 Bundle Size Changes"
  echo ""
  echo "| Format | Base | Current | Change |"
  echo "|--------|------|---------|--------|"
  echo "| ESM | $(format_size $BASE_ESM) | $(format_size $PR_ESM) | $(format_diff $ESM_DIFF) |"
  echo "| CJS | $(format_size $BASE_CJS) | $(format_size $PR_CJS) | $(format_diff $CJS_DIFF) |"
  echo "| UMD | $(format_size $BASE_UMD) | $(format_size $PR_UMD) | $(format_diff $UMD_DIFF) |"
  echo ""
  
  # Add warning for significant size increases
  total_diff=$((ESM_DIFF + CJS_DIFF + UMD_DIFF))
  if [ "$total_diff" -gt 5000 ]; then
    echo "⚠️ **Warning:** Total bundle size increased by $(format_diff $total_diff)"
  elif [ "$total_diff" -lt -1000 ]; then
    echo "🎉 **Great:** Total bundle size decreased by $(format_diff $total_diff)"
  fi
} >> "$GITHUB_STEP_SUMMARY"

# Also output to console
echo ""
echo "📊 Bundle Size Comparison Results:"
echo "=================================="
echo "ESM:     $(format_size $BASE_ESM) → $(format_size $PR_ESM) ($(format_diff $ESM_DIFF))"
echo "CJS:     $(format_size $BASE_CJS) → $(format_size $PR_CJS) ($(format_diff $CJS_DIFF))"
echo "UMD:     $(format_size $BASE_UMD) → $(format_size $PR_UMD) ($(format_diff $UMD_DIFF))"
echo ""
echo "✅ Bundle size comparison completed"
