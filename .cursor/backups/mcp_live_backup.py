#!/usr/bin/env python3
"""Build final backup artifacts when raw dumps are missing — merges on-disk raw + normalized cache."""
from __future__ import annotations

import json
from pathlib import Path

from build_webflow_copy_backup import (
    BACKUP_DIR,
    OUT_JSON,
    OUT_MD,
    PAGES,
    RAW_DIR,
    build_page_backup,
    parse_raw_file,
    render_markdown,
)
from datetime import date

CACHE_DIR = BACKUP_DIR / "normalized_cache"


def load_page(meta: dict) -> dict:
    raw_path = RAW_DIR / f"{meta['pageId']}.json"
    if raw_path.exists():
        return build_page_backup(meta, raw_path)
    cache_path = CACHE_DIR / f"{meta['pageId']}.json"
    if cache_path.exists():
        return json.loads(cache_path.read_text(encoding="utf-8"))
    raise FileNotFoundError(meta["pageId"])


def write_cache_from_raw() -> None:
    """Populate normalized_cache from any existing raw dumps."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    for meta in PAGES:
        raw_path = RAW_DIR / f"{meta['pageId']}.json"
        if not raw_path.exists():
            continue
        cache_path = CACHE_DIR / f"{meta['pageId']}.json"
        if cache_path.exists():
            continue
        page = build_page_backup(meta, raw_path)
        cache_path.write_text(json.dumps(page, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def save_cache_page(meta: dict, page: dict) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / f"{meta['pageId']}.json"
    path.write_text(json.dumps(page, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_from_raw_or_cache() -> dict:
    pages_out: list[dict] = []
    missing: list[str] = []
    for meta in PAGES:
        try:
            pages_out.append(load_page(meta))
        except FileNotFoundError:
            missing.append(meta["pageId"])
    if missing:
        raise SystemExit(
            "Missing data for pages: "
            + ", ".join(missing)
            + ". Save MCP dumps under raw/<pageId>.json or normalized_cache/<pageId>.json"
        )
    total_text = sum(p["textNodeCount"] for p in pages_out)
    total_props = sum(p["componentTextPropCount"] for p in pages_out)
    return {
        "siteId": "6a6cb753d670ca285ae24781",
        "generatedAt": date.today().isoformat(),
        "method": "data_element_tool query_elements (Heading, Paragraph, Button, TextLink, Link, LinkBlock, RichText, form labels) with children_depth=-1; component text from get_all_elements trees",
        "pageCount": len(pages_out),
        "totalTextNodes": total_text,
        "totalComponentTextProps": total_props,
        "pages": pages_out,
    }


def main() -> None:
    write_cache_from_raw()
    backup = build_from_raw_or_cache()
    OUT_JSON.write_text(json.dumps(backup, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(backup), encoding="utf-8")
    print(
        json.dumps(
            {
                "json": str(OUT_JSON),
                "md": str(OUT_MD),
                "pages": backup["pageCount"],
                "textNodes": backup["totalTextNodes"],
            }
        )
    )


if __name__ == "__main__":
    main()
