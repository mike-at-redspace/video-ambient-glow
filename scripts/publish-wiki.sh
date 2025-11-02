#!/bin/bash

# Script to publish wiki to GitHub
set -e

WIKI_DIR="wiki"
WIKI_REPO_DIR="wiki-repo"
WIKI_REPO_URL="https://github.com/mike-at-redspace/video-ambient-glow.wiki.git"

# Check if wiki directory exists
if [ ! -d "$WIKI_DIR" ]; then
  echo "Error: wiki directory not found"
  exit 1
fi

# Initialize wiki repo if it doesn't exist
if [ ! -d "$WIKI_REPO_DIR" ]; then
  echo "Initializing wiki repository..."
  mkdir -p "$WIKI_REPO_DIR"
  cd "$WIKI_REPO_DIR"
  git init
  git remote add origin "$WIKI_REPO_URL" 2>/dev/null || true
  cd ..
fi

# Copy wiki files
echo "Syncing wiki files..."
cp "$WIKI_DIR"/*.md "$WIKI_REPO_DIR/" 2>/dev/null || true

# Commit and push
cd "$WIKI_REPO_DIR"
git add *.md 2>/dev/null || true

# Check if there are changes
if git diff --staged --quiet; then
  echo "No changes to commit"
  exit 0
fi

# Pull latest changes
git pull origin master --no-rebase --allow-unrelated-histories 2>/dev/null || true

# Commit
COMMIT_MSG="${1:-Update wiki documentation}"
git commit -m "$COMMIT_MSG"

# Push
echo "Pushing to GitHub..."
git push origin master || git push origin master --set-upstream

echo "Wiki published successfully!"
