#!/usr/bin/env bash
# Site health check, run by .github/workflows/site-health.yml.
# Passes when the feed page loads within MAX_SECONDS, lists headlines, and its newest headline
# is at most MAX_NEWEST_AGE_HOURS old. One failed attempt is retried after a minute, so a single
# slow request does not send an alert. Writes a short report to the GitHub run summary.
set -uo pipefail

SITE_URL="${SITE_URL:-https://watchtower01.vercel.app/}"
MAX_SECONDS="${MAX_SECONDS:-20}"
MAX_NEWEST_AGE_HOURS="${MAX_NEWEST_AGE_HOURS:-36}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"
PAGE="$(mktemp)"

report() { echo "$1"; echo "$1" >>"$SUMMARY"; }

if [ "${TEST_FAILURE:-false}" = "true" ]; then
  report "Test failure requested: this run fails on purpose so the alert email can be checked."
  exit 1
fi

# One attempt. Prints a reason and returns 1 on failure.
check_once() {
  local result code seconds headlines newest newest_s age_h
  result="$(curl -sS -o "$PAGE" -w '%{http_code} %{time_total}' --max-time "$MAX_SECONDS" "$SITE_URL" 2>&1)" || {
    echo "The page did not load within ${MAX_SECONDS} seconds (${result})."
    return 1
  }
  code="${result%% *}"
  seconds="${result##* }"
  if [ "$code" != "200" ]; then
    echo "The page answered HTTP ${code} instead of 200."
    return 1
  fi
  headlines="$(grep -o '<li class="article"' "$PAGE" | wc -l)"
  if [ "$headlines" -eq 0 ]; then
    echo "The page loaded but listed no headlines."
    return 1
  fi
  # The feed is newest first; each headline carries its publication time as <time dateTime="...">.
  newest="$(grep -o -i 'datetime="[^"]*"' "$PAGE" | head -n 1 | cut -d'"' -f2)"
  if ! newest_s="$(date -u -d "$newest" +%s 2>/dev/null)"; then
    echo "Could not read the newest headline's time (\"${newest}\")."
    return 1
  fi
  age_h=$(( ($(date -u +%s) - newest_s) / 3600 ))
  if [ "$age_h" -gt "$MAX_NEWEST_AGE_HOURS" ]; then
    echo "The newest headline is ${age_h} hours old (limit ${MAX_NEWEST_AGE_HOURS}). News collection may have stopped."
    return 1
  fi
  echo "OK: HTTP 200 in ${seconds}s, ${headlines} headlines listed, newest published ${age_h} hours ago (${newest})."
}

for attempt in 1 2; do
  if message="$(check_once)"; then
    report "$message"
    exit 0
  fi
  report "Attempt ${attempt} failed: ${message}"
  [ "$attempt" -eq 1 ] && sleep 60
done

report "Watchtower looks unhealthy: both attempts failed. Site: ${SITE_URL}"
exit 1
