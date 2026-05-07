#!/bin/bash
set -euo pipefail

# Only run setup in Claude Code on the web (remote) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies. Using `npm install` (not `npm ci`) so the cached
# container state can be reused across sessions and the install is idempotent.
npm install --no-audit --no-fund --prefer-offline
