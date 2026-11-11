#!/usr/bin/env python3
"""Write one MCP action object from stdin to raw/<pageId>.<query|tree>.json"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: write_mcp_action_stdin.py <pageId> <query|tree>")
    page_id, kind = sys.argv[1], sys.argv[2]
    data = sys.stdin.read().strip()
    # Allow wrapping the action object only or a list of actions
    parsed = json.loads(data)
    if isinstance(parsed, list):
        for item in parsed:
            if not isinstance(item, dict):
                continue
            lab = item.get("label")
            act = item.get("action")
            if kind == "query" and (lab == "query" or act == "query_elements"):
                parsed = item
                break
            if kind == "tree" and (lab == "tree" or act == "get_all_elements"):
                parsed = item
                break
    if not isinstance(parsed, dict):
        raise SystemExit("expected one action object")
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.{kind}.json"
    out.write_text(json.dumps(parsed, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(out), "bytes": out.stat().st_size}))


if __name__ == "__main__":
    main()
