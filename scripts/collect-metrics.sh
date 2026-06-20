#!/usr/bin/env bash
#
# Collects observe:metrics from two EAS apps and consolidates into a single CSV.
# Usage: ./scripts/collect-metrics.sh [--days N] [--limit N] [--platform ios|android]
#
# Output: metrics.csv in the current directory

set -euo pipefail

APPS=(
  "food-for-me|2f5bdb5c-168e-4320-b66d-f085e55ac69e"
  "food-for-my-pet|7b29b5e4-1ac9-41b8-b9d9-09e59f05a146"
)

METRICS=(tti ttr cold_launch warm_launch bundle_load update_download)

DAYS=30
LIMIT=100
PLATFORM_FLAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --days)    DAYS="$2"; shift 2 ;;
    --limit)   LIMIT="$2"; shift 2 ;;
    --platform) PLATFORM_FLAG="--platform $2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

OUTPUT="metrics.csv"
TMPDIR_BASE=$(mktemp -d)
trap 'rm -rf "$TMPDIR_BASE"' EXIT

# CSV header
echo "app,id,metricName,metricValue,appVersion,appBuildNumber,appUpdateId,deviceModel,deviceOs,deviceOsVersion,countryCode,sessionId,easClientId,timestamp,url,networkConnected,networkType,lowPowerMode,thermalState,slowFrames,frozenFrames,frameRateTotalDelay" > "$OUTPUT"

fetch_all_pages() {
  local app_label="$1"
  local project_id="$2"
  local metric="$3"
  local tmpdir="$4"
  local cursor=""
  local tmpfile="$tmpdir/${app_label}_${metric}.jsonl"

  while true; do
    local cursor_flag=""
    if [[ -n "$cursor" ]]; then
      cursor_flag="--after $cursor"
    fi

    local result
    result=$(npx eas-cli@latest observe:metrics "$metric" \
      --json \
      --non-interactive \
      --project-id "$project_id" \
      --days "$DAYS" \
      --limit "$LIMIT" \
      --sort newest \
      $PLATFORM_FLAG \
      $cursor_flag 2>/dev/null) || break

    local count
    count=$(echo "$result" | jq '.events | length')
    if [[ "$count" -eq 0 ]]; then
      break
    fi

    echo "$result" >> "$tmpfile"

    local has_next
    has_next=$(echo "$result" | jq -r '.pageInfo.hasNextPage')
    if [[ "$has_next" != "true" ]]; then
      break
    fi

    cursor=$(echo "$result" | jq -r '.pageInfo.endCursor')
  done
}

export -f fetch_all_pages
export DAYS LIMIT PLATFORM_FLAG

echo "Collecting metrics (--days $DAYS, --limit $LIMIT per page)..."

pids=()
for app_entry in "${APPS[@]}"; do
  IFS='|' read -r app_label project_id <<< "$app_entry"
  for metric in "${METRICS[@]}"; do
    echo "  Fetching $metric for $app_label..."
    fetch_all_pages "$app_label" "$project_id" "$metric" "$TMPDIR_BASE" &
    pids+=($!)
  done
done

for pid in "${pids[@]}"; do
  wait "$pid" || true
done

echo "Processing results..."

for app_entry in "${APPS[@]}"; do
  IFS='|' read -r app_label project_id <<< "$app_entry"
  for metric in "${METRICS[@]}"; do
    tmpfile="$TMPDIR_BASE/${app_label}_${metric}.jsonl"
    if [[ -f "$tmpfile" ]]; then
      jq -r --arg app "$app_label" '
        .events[] |
        [
          $app,
          .id,
          .metricName,
          .metricValue,
          .appVersion,
          .appBuildNumber,
          (.appUpdateId // ""),
          .deviceModel,
          .deviceOs,
          .deviceOsVersion,
          .countryCode,
          .sessionId,
          .easClientId,
          .timestamp,
          (.customParams.url // ""),
          (.customParams["expo.network.connected"] // ""),
          (.customParams["expo.network.type"] // ""),
          (.customParams["expo.device.lowPowerMode"] // ""),
          (.customParams["expo.device.thermalState"] // ""),
          (.customParams["expo.frameRate.slowFrames"] // ""),
          (.customParams["expo.frameRate.frozenFrames"] // ""),
          (.customParams["expo.frameRate.totalDelay"] // "")
        ] | @csv
      ' "$tmpfile" >> "$OUTPUT"
    fi
  done
done

total=$(tail -n +2 "$OUTPUT" | wc -l | tr -d ' ')
echo "Done! Wrote $total rows to $OUTPUT"
