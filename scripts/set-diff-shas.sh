#!/usr/bin/env bash

# Set BASE_SHA and HEAD_SHA environment variables for diff operations
# Usage: ./set-diff-shas.sh

set -euo pipefail

WORKFLOW_EVENT="${GITHUB_EVENT_NAME:-push}"

echo "🔧 Setting diff SHAs for event: $WORKFLOW_EVENT"

if [ "$WORKFLOW_EVENT" = "pull_request" ]; then
  BASE_SHA="${GITHUB_BASE_SHA:-}"
  HEAD_SHA="${GITHUB_HEAD_SHA:-}"
  
  if [ -z "$BASE_SHA" ]; then
    echo "⚠️ GITHUB_BASE_SHA not available, using event data"
    BASE_SHA="${GITHUB_EVENT_PULL_REQUEST_BASE_SHA:-}"
  fi
  
  if [ -z "$HEAD_SHA" ]; then
    echo "⚠️ GITHUB_HEAD_SHA not available, using event data"  
    HEAD_SHA="${GITHUB_EVENT_PULL_REQUEST_HEAD_SHA:-}"
  fi
  
  echo "📋 Pull Request detected"
  echo "   Base: $BASE_SHA"
  echo "   Head: $HEAD_SHA"
else
  BASE_SHA="${GITHUB_EVENT_BEFORE:-}"
  HEAD_SHA="${GITHUB_EVENT_AFTER:-}"
  
  echo "📋 Push event detected"
  echo "   Before: $BASE_SHA"
  echo "   After: $HEAD_SHA"
fi

# Validate SHAs
if [ -n "$BASE_SHA" ] && [ -n "$HEAD_SHA" ]; then
  if git rev-parse "$BASE_SHA" >/dev/null 2>&1 && git rev-parse "$HEAD_SHA" >/dev/null 2>&1; then
    echo "BASE_SHA=$BASE_SHA" >> $GITHUB_ENV
    echo "HEAD_SHA=$HEAD_SHA" >> $GITHUB_ENV
    echo "✅ SHAs validated and set"
  else
    echo "⚠️ One or both SHAs are invalid, will use fallback methods"
    echo "BASE_SHA=" >> $GITHUB_ENV
    echo "HEAD_SHA=" >> $GITHUB_ENV
  fi
else
  echo "⚠️ SHAs not available, will use fallback methods"
  echo "BASE_SHA=" >> $GITHUB_ENV
  echo "HEAD_SHA=" >> $GITHUB_ENV
fi

echo "🏁 Diff SHA setup completed"
