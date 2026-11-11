#!/usr/bin/env python3
"""Read NDJSON lines: pageId<TAB>tree-json-object -> write_mcp_action_stdin."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    n = 0
    for line in sys.stdin:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "\t" not in line:
            raise SystemExit(f"expected pageId\\tjson, got: {line[:80]}...")
        page_id, payload = line.split("\t", 1)
        subprocess.check_call(
            [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, "tree"],
            input=payload,
            text=True,
            cwd=str(ROOT),
        )
        n += 1
    if n == 0:
        raise SystemExit("no lines")
    print(f"persisted {n} trees")


if __name__ == "__main__":
    main()
