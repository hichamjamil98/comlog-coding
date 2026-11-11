#!/usr/bin/env python3
"""Concatenate incoming/chunks/<pageId>/*.txt -> incoming/<pageId>.tree.mcp.json and persist."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INCOMING = ROOT / "incoming"
CHUNKS = INCOMING / "chunks"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: persist_incoming_chunked.py <pageId>")
    page_id = sys.argv[1]
    cdir = CHUNKS / page_id
    if not cdir.is_dir():
        raise SystemExit(f"missing {cdir}")
    parts = sorted(cdir.glob("*.txt"))
    if not parts:
        raise SystemExit(f"no chunks in {cdir}")
    text = "".join(p.read_text(encoding="utf-8") for p in parts)
    out = INCOMING / f"{page_id}.tree.mcp.json"
    out.write_text(text.strip() + "\n", encoding="utf-8")
    subprocess.check_call(
        [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, "tree"],
        stdin=out.open(encoding="utf-8"),
        cwd=str(ROOT),
    )
    print(out.stat().st_size)


if __name__ == "__main__":
    main()
