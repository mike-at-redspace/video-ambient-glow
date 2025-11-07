#!/usr/bin/env bash

# Check if package version has changed compared to published npm version
# This is more reliable than comparing against HEAD~1 which can fail during rebases
# Usage: ./check-version-changed.sh

set -euo pipefail

echo "🔍 Checking package version changes..."

# Get package name and current version
PACKAGE_NAME=$(node -p "require('./package.json').name")
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "📦 Package: $PACKAGE_NAME"
echo "📋 Current version: $CURRENT_VERSION"

# Validate version format
if ! [[ "$CURRENT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
  echo "❌ Invalid version format: $CURRENT_VERSION"
  echo "Version must follow semver format (e.g., 1.2.3 or 1.2.3-beta.1)"
  exit 1
fi

# Check the latest published version on npm
echo "🌐 Checking npm registry..."
LATEST_PUBLISHED_VERSION=$(npm view "$PACKAGE_NAME" version 2>/dev/null || echo "0.0.0")

echo "📡 Latest published version: $LATEST_PUBLISHED_VERSION"

# Compare versions
if [ "$CURRENT_VERSION" != "$LATEST_PUBLISHED_VERSION" ]; then
  echo "changed=true" >> $GITHUB_OUTPUT
  echo "version=$CURRENT_VERSION" >> $GITHUB_OUTPUT
  echo "previous_version=$LATEST_PUBLISHED_VERSION" >> $GITHUB_OUTPUT
  echo "✅ Version changed: $LATEST_PUBLISHED_VERSION → $CURRENT_VERSION"
else
  echo "changed=false" >> $GITHUB_OUTPUT
  echo "ℹ️ Version unchanged: $CURRENT_VERSION"
fi

# Additional check: ensure we're not publishing a lower version
if command -v npx >/dev/null 2>&1; then
  # Use semver to compare versions if available
  if npx semver "$CURRENT_VERSION" -r ">$LATEST_PUBLISHED_VERSION" >/dev/null 2>&1; then
    echo "version_direction=upgrade" >> $GITHUB_OUTPUT
    echo "✅ Version is higher than published version"
  elif npx semver "$CURRENT_VERSION" -r "<$LATEST_PUBLISHED_VERSION" >/dev/null 2>&1; then
    echo "version_direction=downgrade" >> $GITHUB_OUTPUT
    echo "⚠️ Warning: Version is lower than published version"
  else
    echo "version_direction=equal" >> $GITHUB_OUTPUT
  fi
fi

echo "🏁 Version check completed"
