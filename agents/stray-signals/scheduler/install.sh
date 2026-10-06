#!/bin/zsh
# Installs a per-user launchd job for Stray Signals. launchd wakes weekly.sh every hour and at
# login; the script itself runs the agent once per ISO week, from Monday 09:00, so a Mac that
# slept through Monday morning catches up at its next hourly check.
set -euo pipefail

LABEL="in.abhisheklalwani.stray-signals"
DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/stray-signals.log"
chmod +x "$DIR/weekly.sh"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$DIR/weekly.sh</string></array>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>$PATH</string></dict>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed $LABEL: checks hourly, runs once a week from Monday 09:00. Logs: $LOG"
echo "Run it now:  launchctl kickstart gui/$(id -u)/$LABEL"
