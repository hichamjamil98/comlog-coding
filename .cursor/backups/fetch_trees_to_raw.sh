#!/usr/bin/env bash
# Persist tree from stdin file: ./fetch_trees_to_raw.sh <pageId> <json-file>
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$DIR/persist_json_stdin.py" "$1" tree < "$2"
