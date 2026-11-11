#!/usr/bin/env python3
"""Persist a single data_element_tool MCP JSON response to raw/ via stdin or file."""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("usage: mcp_fetch_one.py <pageId> <query|tree> [json-file]")
    page_id, kind = sys.argv[1], sys.argv[2]
    if kind not in ("query", "tree"):
        raise SystemExit("kind must be query or tree")
    text = Path(sys.argv[3]).read_text(encoding="utf-8") if len(sys.argv) > 3 else sys.stdin.read()
    obj = json.loads(text.strip())
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.{kind}.json"
    out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(out), "bytes": out.stat().st_size}))


if __name__ == "__main__":
    main()
