#!/usr/bin/env python3
"""Persist one page: read combined MCP text from a file path and write raw/ dumps.

usage: persist_mcp_page.py <pageId> <path-to-mcp-text-file>
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: persist_mcp_page.py <pageId> <mcp-text-file>")
    page_id = sys.argv[1]
    src = Path(sys.argv[2])
    text = src.read_text(encoding="utf-8")
    if not text.strip():
        raise SystemExit("empty file")
    subprocess.check_call(
        [sys.executable, str(BACKUP / "mcp_to_raw.py"), page_id],
        input=text,
        text=True,
    )


if __name__ == "__main__":
    main()
