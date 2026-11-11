#!/usr/bin/env python3
"""Split combined MCP query+tree response into raw/<pageId>.query.json and .tree.json (or .json)."""
from __future__ import annotations

import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"
MARKER = '{"label":"tree"'


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: split_mcp_dump.py <pageId>")
    page_id = sys.argv[1]
    text = sys.stdin.read().strip()
    if not text:
        raise SystemExit("empty stdin")
    RAW.mkdir(parents=True, exist_ok=True)
    if MARKER in text:
        query_part, rest = text.split(MARKER, 1)
        tree_part = MARKER + rest
        (RAW / f"{page_id}.query.json").write_text(query_part.strip() + "\n", encoding="utf-8")
        (RAW / f"{page_id}.tree.json").write_text(tree_part.strip() + "\n", encoding="utf-8")
        print("split", page_id)
    else:
        out = RAW / f"{page_id}.json"
        out.write_text(text + "\n", encoding="utf-8")
        print("combined", page_id)


if __name__ == "__main__":
    main()
