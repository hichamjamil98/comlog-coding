#!/usr/bin/env python3
"""Write one MCP action JSON line to raw/<pageId>.<query|tree>.json"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: write_raw_action.py <pageId> <query|tree>")
    page_id, kind = sys.argv[1], sys.argv[2]
    if kind not in ("query", "tree"):
        raise SystemExit("kind must be query or tree")
    data = sys.stdin.read().strip()
    if not data:
        raise SystemExit("empty stdin")
    json.loads(data)
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.{kind}.json"
    out.write_text(data + "\n", encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
