#!/usr/bin/env python3
"""Assemble Webflow copy backup JSON + markdown from per-page raw MCP dumps."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any

SITE_ID = "6a6cb753d670ca285ae24781"
BACKUP_DIR = Path(__file__).resolve().parent
RAW_DIR = BACKUP_DIR / "raw"
OUT_JSON = BACKUP_DIR / "webflow-copy-backup-2026-11-10.json"
OUT_MD = BACKUP_DIR / "webflow-copy-backup-2026-11-10.md"

PAGES = [
    {"pageId": "6a6cb755d670ca285ae247a7", "title": "Home", "slug": "/"},
    {"pageId": "6a70f253a0580d8eecf3a8df", "title": "Über uns", "slug": "/uber-uns"},
    {"pageId": "6a799f16de8ea50347de4299", "title": "Career", "slug": "/career"},
    {"pageId": "6a76b5079e6781a886028f39", "title": "Contact", "slug": "/contact"},
    {
        "pageId": "6a7115eae9dabbf337810f2d",
        "title": "SPEDITION + Sondertransport",
        "slug": "/services/spedition-sondertransport",
    },
    {
        "pageId": "6a75f97791fb55eb83075d57",
        "title": "Projektlogistik",
        "slug": "/services/projektlogistik",
    },
    {
        "pageId": "6a761d46ca4e2a824be8bf21",
        "title": "Technische dienste",
        "slug": "/services/technische-dienste",
    },
    {
        "pageId": "6a76238d13afbbafae3426ef",
        "title": "Vorfeldservice",
        "slug": "/services/vorfeldservice",
    },
    {
        "pageId": "6a76a6d02080f00d79a0d770",
        "title": "Aviation & Airport Services",
        "slug": "/industries/aviation-airport-services",
    },
    {
        "pageId": "6a76ac1e39669d4a49e27eb7",
        "title": "Kritische Infrastruktur & Sicherheitstechnik",
        "slug": "/industries/kritische-infrastruktur-sicherheitstechnik",
    },
    {
        "pageId": "6a76b150b2ad1918e6fa9e22",
        "title": "Industrie-, Projekt & Speziallogistik",
        "slug": "/industries/industrie-projekt-speziallogistik",
    },
]

TEXT_QUERY_LABELS = {
    "headings",
    "paragraphs",
    "buttons",
    "text_links",
    "link_blocks",
    "links",
    "rich_text",
    "form_labels",
    "list_items",
    "form_inline",
}

SKIP_LINK_STYLE_SNIPPETS = ("swiper--button", "arrow--12")


def elem_key(el: dict[str, Any]) -> str:
    eid = el.get("id") or {}
    return f"{eid.get('component')}:{eid.get('element')}"


def extract_text(node: Any) -> str:
    if not isinstance(node, dict):
        return ""
    parts: list[str] = []
    if node.get("type") == "String" and node.get("textContent"):
        parts.append(str(node["textContent"]))
    for child in node.get("children") or []:
        t = extract_text(child)
        if t:
            parts.append(t)
    return "".join(parts).strip()


def prop_text(value: Any) -> str | None:
    if isinstance(value, str):
        s = value.strip()
        return s or None
    if isinstance(value, dict) and "innerText" in value:
        s = str(value["innerText"]).strip()
        return s or None
    return None


def is_asset_id(value: Any) -> bool:
    return isinstance(value, str) and bool(re.fullmatch(r"[0-9a-f]{24}", value))


def should_skip_link(el: dict[str, Any]) -> bool:
    if el.get("type") != "Link":
        return False
    styles = el.get("styleNames") or []
    joined = " ".join(styles)
    return any(snippet in joined for snippet in SKIP_LINK_STYLE_SNIPPETS) and not extract_text(el)


def walk_component_props(node: Any, acc: list[dict[str, Any]], path: str) -> None:
    if not isinstance(node, dict):
        return
    details = node.get("instanceDetails")
    if details and node.get("type") == "ComponentInstance":
        name = details.get("name") or "ComponentInstance"
        eid = node.get("id") or {}
        for prop in details.get("props") or []:
            pname = prop.get("name") or ""
            if pname in {"Variant", "Image", "Image 1", "Image 2", "Link"}:
                continue
            if is_asset_id(prop.get("value")):
                continue
            text = prop_text(prop.get("value"))
            if text:
                acc.append(
                    {
                        "source": "component_prop",
                        "componentName": name,
                        "propName": pname,
                        "text": text,
                        "elementId": eid,
                        "hasOverride": prop.get("hasOverride"),
                    }
                )
        slots = node.get("slots") or details.get("slots") or []
        if isinstance(slots, list):
            for slot in slots:
                for child in slot.get("children") or []:
                    walk_component_props(child, acc, path)
    for slot in node.get("slots") or []:
        if isinstance(slot, dict):
            for child in slot.get("children") or []:
                walk_component_props(child, acc, path)
    for child in node.get("children") or []:
        walk_component_props(child, acc, path)


def iter_json_objects(text: str) -> list[Any]:
    dec = json.JSONDecoder()
    i = 0
    n = len(text)
    out: list[Any] = []
    while i < n:
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        obj, end = dec.raw_decode(text, i)
        out.append(obj)
        i = end
    return out


def _parse_mcp_text(text: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    if not text.strip():
        return None, None
    query_obj: dict[str, Any] | None = None
    tree_obj: dict[str, Any] | None = None
    try:
        objects = list(iter_json_objects(text))
    except json.JSONDecodeError:
        objects = []
    if not objects:
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                objects.extend(iter_json_objects(line))
            except json.JSONDecodeError:
                try:
                    objects.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    for obj in objects:
        action = obj.get("action")
        label = obj.get("label")
        result = (obj.get("result") or [{}])[0]
        if action == "query_elements" or label == "query":
            query_obj = result.get("data") or result
        elif action == "get_all_elements" or label == "tree":
            tree_obj = result.get("data") or result
    return query_obj, tree_obj


def parse_raw_file(path: Path) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    text = path.read_text(encoding="utf-8")
    return _parse_mcp_text(text)


def load_page_mcp_dump(page_id: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    combined = RAW_DIR / f"{page_id}.json"
    if combined.exists():
        return parse_raw_file(combined)
    query_path = RAW_DIR / f"{page_id}.query.json"
    tree_path = RAW_DIR / f"{page_id}.tree.json"
    query_obj: dict[str, Any] | None = None
    tree_obj: dict[str, Any] | None = None
    if query_path.exists():
        query_obj, _ = _parse_mcp_text(query_path.read_text(encoding="utf-8"))
    if tree_path.exists():
        _, tree_obj = _parse_mcp_text(tree_path.read_text(encoding="utf-8"))
    if query_obj is None and tree_obj is None:
        return None, None
    return query_obj, tree_obj


def normalize_query_data(query_data: Any) -> list[dict[str, Any]]:
    if isinstance(query_data, dict) and "data" in query_data:
        query_data = query_data["data"]
    if not isinstance(query_data, list):
        return []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for group in query_data:
        label = group.get("label")
        if label not in TEXT_QUERY_LABELS:
            continue
        for match in group.get("matches") or []:
            if should_skip_link(match):
                continue
            key = elem_key(match)
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "queryGroup": label,
                    "elementId": match.get("id"),
                    "type": match.get("type"),
                    "styleNames": match.get("styleNames") or [],
                    "attributes": match.get("attributes") or {},
                    "settings": match.get("settings") or {},
                    "text": extract_text(match) or None,
                    "totalMatchesInGroup": group.get("total_matches"),
                }
            )
    return out


def build_page_backup(meta: dict[str, str], raw_path: Path | None = None) -> dict[str, Any]:
    if raw_path is not None and raw_path.exists():
        query_data, tree_data = parse_raw_file(raw_path)
    else:
        query_data, tree_data = load_page_mcp_dump(meta["pageId"])
    text_nodes = normalize_query_data(query_data or [])
    component_text: list[dict[str, Any]] = []
    if tree_data:
        walk_component_props(tree_data, component_text, meta["pageId"])
    return {
        **meta,
        "textNodeCount": len(text_nodes),
        "componentTextPropCount": len(component_text),
        "textNodes": text_nodes,
        "componentTextProps": component_text,
    }


def render_markdown(backup: dict[str, Any]) -> str:
    lines = [
        "# Comlog Webflow copy backup",
        "",
        f"- **Site ID:** `{backup['siteId']}`",
        f"- **Generated:** {backup['generatedAt']}",
        f"- **Pages:** {backup['pageCount']}",
        f"- **Text nodes (query_elements):** {backup['totalTextNodes']}",
        f"- **Component text props:** {backup['totalComponentTextProps']}",
        "",
    ]
    for page in backup["pages"]:
        lines.append(f"## {page['title']} (`{page['slug']}`)")
        lines.append("")
        lines.append(f"Page ID: `{page['pageId']}` — {page['textNodeCount']} text nodes, {page['componentTextPropCount']} component props.")
        lines.append("")
        if page["textNodes"]:
            lines.append("### Canvas text (headings, paragraphs, links, …)")
            lines.append("")
            for node in page["textNodes"]:
                styles = ", ".join(node["styleNames"]) or "(no classes)"
                text = node.get("text")
                eid = node.get("elementId") or {}
                eid_str = f"{eid.get('component')}:{eid.get('element')}"
                label = f"**{node['type']}** [{node['queryGroup']}] `{eid_str}`"
                lines.append(f"- {label} — _{styles}_")
                if text:
                    lines.append(f"  - {text}")
                else:
                    lines.append("  - _(empty / CMS-bound at design time)_")
            lines.append("")
        if page["componentTextProps"]:
            lines.append("### Component instance props (visible copy)")
            lines.append("")
            for prop in page["componentTextProps"]:
                lines.append(
                    f"- **{prop['componentName']}** → `{prop['propName']}`: {prop['text']}"
                )
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    pages_out: list[dict[str, Any]] = []
    missing: list[str] = []
    for meta in PAGES:
        raw_path = RAW_DIR / f"{meta['pageId']}.json"
        query_path = RAW_DIR / f"{meta['pageId']}.query.json"
        tree_path = RAW_DIR / f"{meta['pageId']}.tree.json"
        has_dump = raw_path.exists() or query_path.exists() or tree_path.exists()
        if not has_dump:
            missing.append(meta["pageId"])
            continue
        pages_out.append(build_page_backup(meta, raw_path if raw_path.exists() else None))
    if missing:
        raise SystemExit(f"Missing raw dumps for page IDs: {', '.join(missing)}")

    total_text = sum(p["textNodeCount"] for p in pages_out)
    total_props = sum(p["componentTextPropCount"] for p in pages_out)
    backup = {
        "siteId": SITE_ID,
        "generatedAt": date.today().isoformat(),
        "method": "data_element_tool query_elements (Heading, Paragraph, Button, TextLink, Link, LinkBlock, RichText, form labels) with children_depth=-1; component text from get_all_elements trees",
        "pageCount": len(pages_out),
        "totalTextNodes": total_text,
        "totalComponentTextProps": total_props,
        "pages": pages_out,
    }
    OUT_JSON.write_text(json.dumps(backup, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(backup), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "md": str(OUT_MD), "pages": len(pages_out), "textNodes": total_text}))


if __name__ == "__main__":
    main()
