#!/bin/zsh
# Weekly Stray Signals run, invoked by launchd (see install.sh).
# Pulls main, makes sure Ollama is up, runs the agent while keeping the Mac awake,
# then commits and pushes only the agent's own output files.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO"

# launchd calls this every hour and at login, because a Monday 09:00 calendar trigger is
# silently skipped if the Mac sleeps through it. Run only once per ISO week, from Monday 09:00.
week="$(date +%G-W%V)"
published="$(node -e 'try{console.log(require("./apps/web/src/content/signals-meta.json").version)}catch{}' 2>/dev/null || true)"
[[ "$published" == "$week" ]] && exit 0
[[ "$(date +%u)" == 1 && "$(date +%H)" -lt 9 ]] && exit 0

# One run at a time: a full run can take over an hour.
LOCK="${TMPDIR:-/tmp}/stray-signals.lock"
mkdir "$LOCK" 2>/dev/null || exit 0
trap 'rmdir "$LOCK"' EXIT

echo "── $(date '+%Y-%m-%d %H:%M:%S') Stray Signals weekly run for $week in $REPO"

branch="$(git branch --show-current)"
if [[ "$branch" != "main" ]]; then
  echo "Repo is on '$branch', not main — skipping so local work is never touched."
  exit 0
fi
git pull --rebase --autostash --quiet origin main

if ! curl -sf http://127.0.0.1:11434/api/version >/dev/null; then
  echo "Starting Ollama…"
  open -ga Ollama 2>/dev/null || (nohup ollama serve >/dev/null 2>&1 &)
  for _ in {1..30}; do curl -sf http://127.0.0.1:11434/api/version >/dev/null && break; sleep 2; done
fi

caffeinate -i npm run signals --silent

outputs=(agents/stray-signals/data apps/web/src/content/signals.json apps/web/src/content/signals-meta.json)
git add -- "${outputs[@]}"
if git diff --cached --quiet -- "${outputs[@]}"; then
  echo "No changes to publish."
  exit 0
fi
git commit --quiet -m "chore(signals): weekly refresh ${week}" -- "${outputs[@]}"
# The run takes a while: pick up anything pushed meanwhile before publishing.
git pull --rebase --autostash --quiet origin main
git push --quiet origin main
echo "Pushed ${week}; Vercel will redeploy."
