#!/bin/zsh
# Weekly Stray Signals run, invoked by launchd (see install.sh).
# Pulls main, makes sure Ollama is up, runs the agent while keeping the Mac awake,
# then commits and pushes only the agent's own output files.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO"
echo "── $(date '+%Y-%m-%d %H:%M:%S') Stray Signals weekly run in $REPO"

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
week="$(node -e 'const d=require("./apps/web/src/content/signals-meta.json");console.log(d.version)')"
git commit --quiet -m "chore(signals): weekly refresh ${week}" -- "${outputs[@]}"
git push --quiet origin main
echo "Pushed ${week}; Vercel will redeploy."
