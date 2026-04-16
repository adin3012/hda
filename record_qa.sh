#!/bin/bash
# HDA QA Screen Recording — desktop + mobile views + terminal script
set -e

PROJECT="/Users/apple/Desktop/Projects/hda"
OUT="$PROJECT/qa_recording.mp4"
PORT=5502
SERVER_PID=""

cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null
  osascript -e 'tell application "Google Chrome" to close every window' 2>/dev/null || true
}
trap cleanup EXIT

echo "▶  Starting local server on port $PORT..."
cd "$PROJECT"
python3 -m http.server $PORT &>/tmp/hda_qa_srv.log &
SERVER_PID=$!
sleep 1

BASE_URL="http://localhost:$PORT"

echo "▶  Opening Chrome — DESKTOP view (1440×900)..."
osascript <<APPLE
tell application "Google Chrome"
  activate
  set newWin to make new window
  set bounds of newWin to {80, 60, 1520, 960}
  set URL of active tab of newWin to "$BASE_URL/index.html"
end tell
APPLE
sleep 3

echo "▶  Cycling through all pages (desktop)..."
for page in coaching.html course.html mentorship.html index.html; do
  osascript -e "tell application \"Google Chrome\" to set URL of active tab of front window to \"$BASE_URL/$page\""
  sleep 2.5
done

echo "▶  Switching to MOBILE view (390×844)..."
osascript <<APPLE
tell application "Google Chrome"
  set bounds of front window to {80, 60, 470, 904}
  set URL of active tab of front window to "$BASE_URL/index.html"
end tell
APPLE
sleep 3

echo "▶  Cycling through all pages (mobile)..."
for page in coaching.html course.html mentorship.html index.html; do
  osascript -e "tell application \"Google Chrome\" to set URL of active tab of front window to \"$BASE_URL/$page\""
  sleep 2.5
done

echo "▶  Running QA script in terminal..."
osascript -e 'tell application "Terminal" to activate'
sleep 1
osascript <<APPLE
tell application "Terminal"
  do script "cd /Users/apple/Desktop/Projects/hda && python3 qa_run.py"
  set bounds of front window to {540, 60, 1520, 960}
  activate
end tell
APPLE

sleep 18

echo ""
echo "✅  Recording session complete — video saved to:"
echo "    $OUT"
