#!/bin/bash

# Script to publish wiki to GitHub
# wiki/ is now a git submodule pointing to the GitHub wiki repository
set -e

WIKI_DIR="wiki"

# Check if wiki submodule exists
if [ ! -d "$WIKI_DIR" ]; then
  echo "Error: wiki submodule not found"
  echo "Initialize it with: git submodule update --init --recursive"
  exit 1
fi

# Check if it's a valid git repository (submodule)
if [ ! -d "$WIKI_DIR/.git" ] && [ ! -f "$WIKI_DIR/.git" ]; then
  echo "Error: wiki directory is not a git submodule"
  echo "Initialize it with: git submodule update --init --recursive"
  exit 1
fi

# Navigate to wiki submodule
cd "$WIKI_DIR"

# Pull latest changes
echo "Pulling latest wiki changes..."
git pull origin master --no-rebase 2>/dev/null || true

# Check if there are changes
git add *.md 2>/dev/null || true

if git diff --staged --quiet && git diff --quiet; then
  echo "No changes to commit"
  cd ..
  exit 0
fi

# Commit
COMMIT_MSG="${1:-Update wiki documentation}"
echo "Committing changes..."
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Push
echo "Pushing to GitHub..."
git push origin master || git push origin master --set-upstream

cd ..

echo "Wiki published successfully!"
echo "Don't forget to commit the submodule update in the main repo:"
echo "  git add wiki"
echo "  git commit -m 'Update wiki submodule'"
