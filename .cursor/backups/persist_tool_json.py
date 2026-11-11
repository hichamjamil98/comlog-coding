#!/usr/bin/env python3
"""Write MCP tool JSON response to raw/<pageId>.json (stdin or file arg)."""
from __future__ import annotations

import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: persist_tool_json.py <pageId> [source-file]")
    page_id = sys.argv[1]
    RAW.mkdir(parents=True, exist_ok=True)
    dest = RAW / f"{page_id}.json"
    if len(sys.argv) >= 3:
        data = Path(sys.argv[2]).read_text(encoding="utf-8")
    else:
        data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty input")
    dest.write_text(data if data.endswith("\n") else data + "\n", encoding="utf-8")
    print(dest)


if __name__ == "__main__":
    main()
