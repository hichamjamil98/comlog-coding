#!/usr/bin/env python3
"""usage: store_dump.py <pageId> <chunk> [chunk ...]  # concatenates chunks to mcp_to_raw stdin"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("usage: store_dump.py <pageId> <chunk> [chunk ...]")
    page_id = sys.argv[1]
    text = "".join(sys.argv[2:])
    if not text.strip():
        raise SystemExit("empty dump")
    subprocess.check_call(
        [sys.executable, str(BACKUP / "mcp_to_raw.py"), page_id],
        input=text,
        text=True,
    )


if __name__ == "__main__":
    main()
