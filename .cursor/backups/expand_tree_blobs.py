#!/usr/bin/env python3
"""Decode tree_blobs.json and persist each via write_mcp_action_stdin.py."""
from __future__ import annotations

import base64
import gzip
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BLOBS = ROOT / "tree_blobs.json"


def main() -> None:
    if not BLOBS.is_file():
        raise SystemExit(f"missing {BLOBS}")
    store: dict[str, str] = json.loads(BLOBS.read_text(encoding="utf-8"))
    for page_id, b64 in sorted(store.items()):
        raw = gzip.decompress(base64.b64decode(b64)).decode("utf-8")
        subprocess.check_call(
            [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, "tree"],
            input=raw,
            text=True,
            cwd=str(ROOT),
        )
    print(f"persisted {len(store)} trees")


if __name__ == "__main__":
    main()
