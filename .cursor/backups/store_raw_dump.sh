#!/usr/bin/env bash
# usage: store_raw_dump.sh <pageId> <dump-file>
set -euo pipefail
PAGE_ID="${1:?pageId}"
DUMP_FILE="${2:?dump file}"
RAW_DIR="$(cd "$(dirname "$0")" && pwd)/raw"
mkdir -p "$RAW_DIR"
cp "$DUMP_FILE" "$RAW_DIR/${PAGE_ID}.json"
echo "$RAW_DIR/${PAGE_ID}.json"
