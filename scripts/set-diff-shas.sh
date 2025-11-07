#!/usr/bin/env bash

# Set BASE_SHA and HEAD_SHA environment variables for diff operations
# Usage: ./set-diff-shas.sh [base_sha] [head_sha]

set -euo pipefail

# Parameters from workflow (more reliable than reading event JSON)
BASE_SHA_PARAM="${1:-}"
HEAD_SHA_PARAM="${2:-}"

WORKFLOW_EVENT="${GITHUB_EVENT_NAME:-push}"

echo "🔧 Setting diff SHAs for event: $WORKFLOW_EVENT"

if [ "$WORKFLOW_EVENT" = "pull_request" ]; then
  # Use parameters passed from workflow context
  BASE_SHA="$BASE_SHA_PARAM"
  HEAD_SHA="$HEAD_SHA_PARAM"
  
  # Fallback: read from event JSON if parameters not provided  
  if [ -z "$BASE_SHA" ] || [ -z "$HEAD_SHA" ]; then
    echo "📄 Reading from GitHub event JSON as fallback..."
    if [ -f "$GITHUB_EVENT_PATH" ] && command -v jq >/dev/null 2>&1; then
      BASE_SHA=$(jq -r '.pull_request.base.sha // empty' "$GITHUB_EVENT_PATH")
      HEAD_SHA=$(jq -r '.pull_request.head.sha // empty' "$GITHUB_EVENT_PATH")
    else
      echo "⚠️ Event JSON file not found or jq not available"
    fi
  fi
  
  echo "📋 Pull Request detected"
  echo "   Base: $BASE_SHA"
  echo "   Head: $HEAD_SHA"
else
  # For push events, use GitHub event environment variables
  BASE_SHA="${GITHUB_EVENT_BEFORE:-}"
  HEAD_SHA="${GITHUB_EVENT_AFTER:-}"
  
  echo "📋 Push event detected"
  echo "   Before: $BASE_SHA"
  echo "   After: $HEAD_SHA"
fi

# Validate SHAs and ensure they exist in the repository
if [ -n "$BASE_SHA" ] && [ -n "$HEAD_SHA" ]; then
  # Validate BASE_SHA
  if git rev-parse "$BASE_SHA" >/dev/null 2>&1; then
    echo "✅ Base SHA validated: $BASE_SHA"
  else
    echo "⚠️ Base SHA invalid or not found: $BASE_SHA"
    BASE_SHA=""
  fi
  
  # Validate HEAD_SHA
  if git rev-parse "$HEAD_SHA" >/dev/null 2>&1; then
    echo "✅ Head SHA validated: $HEAD_SHA"
  else
    echo "⚠️ Head SHA invalid or not found: $HEAD_SHA"
    HEAD_SHA=""
  fi
fi

# Set environment variables for subsequent steps
if [ -n "$BASE_SHA" ] && [ -n "$HEAD_SHA" ]; then
  echo "BASE_SHA=$BASE_SHA" >> $GITHUB_ENV
  echo "HEAD_SHA=$HEAD_SHA" >> $GITHUB_ENV
  echo "✅ Valid SHAs set for diff operations"
else
  echo "BASE_SHA=" >> $GITHUB_ENV
  echo "HEAD_SHA=" >> $GITHUB_ENV
  echo "⚠️ SHAs not available - change detection will use fallback methods"
fi

echo "🏁 Diff SHA setup completed"
