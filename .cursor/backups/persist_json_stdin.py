#!/usr/bin/env python3
"""Persist one MCP action object from stdin: persist_json_stdin.py <pageId> <query|tree>"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: persist_json_stdin.py <pageId> <query|tree>")
    page_id, kind = sys.argv[1], sys.argv[2]
    if kind not in ("query", "tree"):
        raise SystemExit("kind must be query or tree")
    obj = json.loads(sys.stdin.read())
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.{kind}.json"
    out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(out), "bytes": out.stat().st_size}))


if __name__ == "__main__":
    main()
