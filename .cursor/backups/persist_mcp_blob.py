#!/usr/bin/env python3
"""Persist one or more concatenated MCP JSON objects to raw/<pageId>.{query,tree}.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from build_webflow_copy_backup import iter_json_objects

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: persist_mcp_blob.py <pageId> [json-file]")
    page_id = sys.argv[1]
    text = Path(sys.argv[2]).read_text(encoding="utf-8") if len(sys.argv) > 2 else sys.stdin.read()
    RAW.mkdir(parents=True, exist_ok=True)
    wrote: list[str] = []
    for obj in iter_json_objects(text):
        label = obj.get("label")
        action = obj.get("action")
        if label == "query" or action == "query_elements":
            kind = "query"
        elif label == "tree" or action == "get_all_elements":
            kind = "tree"
        else:
            continue
        out = RAW / f"{page_id}.{kind}.json"
        out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
        wrote.append(f"{kind}:{out.stat().st_size}")
    if not wrote:
        raise SystemExit("no query/tree objects in input")
    print(page_id, ", ".join(wrote))


if __name__ == "__main__":
    main()
