#!/bin/zsh
set -euo pipefail
LABEL="in.abhisheklalwani.stray-signals"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
echo "Removed $LABEL."
