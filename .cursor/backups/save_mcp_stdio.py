#!/usr/bin/env python3
"""Read combined MCP query+tree from stdin and split into raw/<pageId>.{query,tree}.json."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: save_mcp_stdio.py <pageId>")
    page_id = sys.argv[1]
    text = sys.stdin.read()
    if not text.strip():
        raise SystemExit("empty stdin")
    subprocess.check_call(
        [sys.executable, str(BACKUP / "mcp_to_raw.py"), page_id],
        input=text,
        text=True,
    )


if __name__ == "__main__":
    main()
