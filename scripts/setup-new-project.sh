#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Setup New Project from Boilerplate
# ============================================================
#
# This script creates a new project from the boilerplate.
# It clones the boilerplate, configures remotes, sets up the
# merge strategy, and prepares the project for development.
#
# Usage:
#   ./scripts/setup-new-project.sh
#
# See .github/SETUP_NEW_PROJECT.md for full documentation.
# ============================================================

BOILERPLATE_REPO="https://github.com/arnaudmarchot/boilerplate.git"

echo ""
echo "========================================"
echo "  New Project Setup from Boilerplate"
echo "========================================"
echo ""

# --- Project name ---
read -rp "Project name (e.g. my-app): " PROJECT_NAME
if [[ -z "$PROJECT_NAME" ]]; then
    echo "Error: Project name is required."
    exit 1
fi

# --- Remote URL ---
read -rp "Git remote URL for the new project (e.g. git@github.com:user/my-app.git): " REMOTE_URL
if [[ -z "$REMOTE_URL" ]]; then
    echo "Error: Remote URL is required."
    exit 1
fi

# --- Boilerplate repo override ---
read -rp "Boilerplate repo URL [$BOILERPLATE_REPO]: " CUSTOM_BOILERPLATE
if [[ -n "$CUSTOM_BOILERPLATE" ]]; then
    BOILERPLATE_REPO="$CUSTOM_BOILERPLATE"
fi

echo ""
echo "Configuration:"
echo "  Project name:    $PROJECT_NAME"
echo "  Remote URL:      $REMOTE_URL"
echo "  Boilerplate:     $BOILERPLATE_REPO"
echo ""
read -rp "Continue? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "--- Cloning boilerplate..."
git clone "$BOILERPLATE_REPO" "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo ""
echo "--- Configuring remotes..."
git remote rename origin upstream
git remote add origin "$REMOTE_URL"

echo ""
echo "--- Configuring merge strategy (theirs)..."
git config merge.theirs.driver true

echo ""
echo "--- Updating site-config.js..."
sed -i.bak "s/title: \"Boilerplate\"/title: \"$PROJECT_NAME\"/" src/site-config.js
sed -i.bak "s/appId: \"boilerplate\"/appId: \"$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')\"/" src/site-config.js
rm -f src/site-config.js.bak

echo ""
echo "--- Creating initial commit..."
git add -A
git commit -m "Initialize $PROJECT_NAME from boilerplate"

echo ""
echo "--- Pushing to origin..."
git push -u origin main

echo ""
echo "========================================"
echo "  Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "  1. cd $PROJECT_NAME"
echo "  2. cp .env.example .env"
echo "  3. Edit .env with your database and API credentials"
echo "  4. bun install"
echo "  5. bun prisma generate"
echo "  6. bun prisma db push"
echo "  7. bun dev"
echo ""
echo "To update from boilerplate later:"
echo ""
echo "  git fetch upstream"
echo "  git merge upstream/main"
echo "  bun install"
echo "  bun prisma generate"
echo ""
echo "Your project files in src/project/ will never be"
echo "overwritten by upstream updates."
echo ""
