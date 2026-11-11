#!/usr/bin/env python3
"""Split query+tree concat file into raw/<pageId>.query.json and .tree.json."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: save_dual_mcp_file.py <pageId> <concat-json-file>")
    page_id, src = sys.argv[1], Path(sys.argv[2])
    text = src.read_text(encoding="utf-8")
    if not text.strip():
        raise SystemExit("empty file")
    p = subprocess.run(
        [sys.executable, str(BACKUP / "split_mcp_dump.py"), page_id],
        input=text,
        text=True,
        capture_output=True,
    )
    if p.returncode != 0:
        sys.stderr.write(p.stderr or "")
        raise SystemExit(p.returncode)
    if p.stdout:
        print(p.stdout, end="")


if __name__ == "__main__":
    main()
