#!/usr/bin/env python3
"""Write MCP page dump (stdin) to .cursor/backups/raw/<pageId>.json"""
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: save_mcp_page_dump.py <pageId>")
    page_id = sys.argv[1]
    RAW.mkdir(parents=True, exist_ok=True)
    data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty stdin")
    (RAW / f"{page_id}.json").write_text(data if data.endswith("\n") else data + "\n", encoding="utf-8")
    print(RAW / f"{page_id}.json")


if __name__ == "__main__":
    main()
