#!/usr/bin/env bash

# Check for changes in specified directory with robust git diff handling
# Usage: ./check-changes.sh <directory> <force_flag>
# Example: ./check-changes.sh ./src "${{ inputs.force_build }}"

set -euo pipefail

DIRECTORY="${1:-./src}"  
FORCE_FLAG="${2:-false}"
WORKFLOW_EVENT="${GITHUB_EVENT_NAME:-push}"
EVENT_BEFORE="${GITHUB_EVENT_BEFORE:-}"
BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-}"

echo "🔍 Checking changes in: $DIRECTORY"

# Handle force flag
if [ "$WORKFLOW_EVENT" = "workflow_dispatch" ] && [ "$FORCE_FLAG" = "true" ]; then
  echo "changed=true" >> $GITHUB_OUTPUT
  echo "reason=force_flag" >> $GITHUB_OUTPUT
  echo "✅ Force flag enabled - skipping diff check"
  exit 0
fi

# Handle first push to branch
if [ "$EVENT_BEFORE" = "0000000000000000000000000000000000000000" ]; then
  echo "changed=true" >> $GITHUB_OUTPUT
  echo "reason=initial_push" >> $GITHUB_OUTPUT
  echo "✅ Initial push detected - assuming changes"
  exit 0
fi

# Use BASE_SHA and HEAD_SHA if available (set by earlier step)
if [ -n "$BASE_SHA" ] && [ -n "$HEAD_SHA" ]; then
  if git rev-parse "$BASE_SHA" >/dev/null 2>&1 && git rev-parse "$HEAD_SHA" >/dev/null 2>&1; then
    if git diff --quiet "$BASE_SHA" "$HEAD_SHA" -- "$DIRECTORY"; then
      echo "changed=false" >> $GITHUB_OUTPUT
      echo "reason=no_changes" >> $GITHUB_OUTPUT
      echo "ℹ️ No changes detected in $DIRECTORY"
    else
      echo "changed=true" >> $GITHUB_OUTPUT
      echo "reason=directory_modified" >> $GITHUB_OUTPUT
      echo "✅ Changes detected in $DIRECTORY"
    fi
    exit 0
  fi
fi

# Fallback to HEAD~1 comparison
if git rev-parse HEAD~1 >/dev/null 2>&1; then
  if git diff --quiet HEAD~1 HEAD -- "$DIRECTORY"; then
    echo "changed=false" >> $GITHUB_OUTPUT
    echo "reason=no_changes_fallback" >> $GITHUB_OUTPUT
    echo "ℹ️ No changes detected in $DIRECTORY (fallback method)"
  else
    echo "changed=true" >> $GITHUB_OUTPUT
    echo "reason=directory_modified_fallback" >> $GITHUB_OUTPUT
    echo "✅ Changes detected in $DIRECTORY (fallback method)"
  fi
else
  # Ultimate fallback - assume changes
  echo "changed=true" >> $GITHUB_OUTPUT
  echo "reason=fallback_assume_changed" >> $GITHUB_OUTPUT
  echo "⚠️ Unable to determine changes - assuming changes exist"
fi
