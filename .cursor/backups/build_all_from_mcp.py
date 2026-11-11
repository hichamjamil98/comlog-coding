#!/usr/bin/env python3
"""
Fetch all pages via Webflow MCP is expected to run outside this script (Agent).
This script builds normalized_cache entries from raw/*.json when present,
and writes final backup JSON + MD via mcp_live_backup.py logic.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP_DIR = Path(__file__).resolve().parent


def main() -> None:
    raw_dir = BACKUP_DIR / "raw"
    missing = []
    for page in __import__("build_webflow_copy_backup", fromlist=["PAGES"]).PAGES:
        if not (raw_dir / f"{page['pageId']}.json").exists():
            missing.append(page["pageId"])
    if missing:
        print("Missing raw dumps:", ", ".join(missing), file=sys.stderr)
        sys.exit(1)
    subprocess.check_call([sys.executable, str(BACKUP_DIR / "build_webflow_copy_backup.py")])


if __name__ == "__main__":
    main()
