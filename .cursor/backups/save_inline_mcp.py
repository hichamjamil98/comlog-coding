#!/usr/bin/env python3
"""Save one inline MCP JSON line to raw/<pageId>.<query|tree>.json (argv or stdin)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("usage: save_inline_mcp.py <pageId> <query|tree> [json-string]")
    page_id, kind = sys.argv[1], sys.argv[2]
    text = sys.argv[3] if len(sys.argv) > 3 else sys.stdin.read()
    obj = json.loads(text.strip())
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.{kind}.json"
    out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print(out, out.stat().st_size)


if __name__ == "__main__":
    main()
