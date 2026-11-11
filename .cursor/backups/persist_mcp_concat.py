#!/usr/bin/env python3
"""Persist concatenated query+tree MCP text to raw/ (split or combined)."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: persist_mcp_concat.py <pageId>  # reads stdin")
    page_id = sys.argv[1]
    data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty stdin")
    marker = '{"label":"tree"'
    split = [sys.executable, str(BACKUP / "split_mcp_dump.py"), page_id]
    save = [sys.executable, str(BACKUP / "save_mcp_page_dump.py"), page_id]
    if marker in data:
        p = subprocess.run(split, input=data, text=True, capture_output=True)
        if p.returncode != 0:
            sys.stderr.write(p.stderr or "")
            raise SystemExit(p.returncode)
        if p.stdout:
            print(p.stdout, end="")
    else:
        p = subprocess.run(save, input=data, text=True, capture_output=True)
        if p.returncode != 0:
            sys.stderr.write(p.stderr or "")
            raise SystemExit(p.returncode)
        if p.stdout:
            print(p.stdout, end="")


if __name__ == "__main__":
    main()
