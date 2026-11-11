#!/usr/bin/env python3
"""Fetch Webflow data_element_tool dumps via project MCP HTTP and write raw/*.json."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

SITE_ID = "6a6cb753d670ca285ae24781"
SESSION_ID = "ses_3LvAndke46pIrZOo1mOnnDjgJfP"
AGENT_ID = "composer|cursor|bkup1"
MCP_URL = "https://mcp.webflow.com/mcp"
BACKUP = Path(__file__).resolve().parent
RAW = BACKUP / "raw"
QUERY_ACTION = json.loads((BACKUP / "mcp_element_actions.json").read_text())[0]
TREE_ACTION = json.loads((BACKUP / "mcp_element_actions.json").read_text())[1]

PAGE_IDS = [
    "6a6cb755d670ca285ae247a7",
    "6a70f253a0580d8eecf3a8df",
    "6a799f16de8ea50347de4299",
    "6a76b5079e6781a886028f39",
    "6a7115eae9dabbf337810f2d",
    "6a75f97791fb55eb83075d57",
    "6a761d46ca4e2a824be8bf21",
    "6a76238d13afbbafae3426ef",
    "6a76a6d02080f00d79a0d770",
    "6a76ac1e39669d4a49e27eb7",
    "6a76b150b2ad1918e6fa9e22",
]


def mcp_call(page_id: str, actions: list) -> list:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "data_element_tool",
            "arguments": {
                "siteId": SITE_ID,
                "pageId": page_id,
                "session_id": SESSION_ID,
                "agent_id": AGENT_ID,
                "context": "Automated Webflow copy backup fetch for all page text nodes.",
                "actions": actions,
            },
        },
    }
    req = urllib.request.Request(
        MCP_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    if body.get("error"):
        raise RuntimeError(body["error"])
    result = body.get("result") or {}
    content = result.get("content") or []
    texts = [c.get("text") for c in content if isinstance(c, dict) and c.get("type") == "text"]
    if not texts:
        raise RuntimeError(f"empty MCP content for {page_id}: {body!r}")
    out_objs = []
    for t in texts:
        t = (t or "").strip()
        if t.startswith("{"):
            out_objs.append(json.loads(t))
    return out_objs


def has_dump(page_id: str) -> bool:
    return (
        (RAW / f"{page_id}.json").exists()
        or ((RAW / f"{page_id}.query.json").exists() and (RAW / f"{page_id}.tree.json").exists())
    )


def save_obj(page_id: str, kind: str, obj: dict) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / f"{page_id}.{kind}.json"
    path.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", path, path.stat().st_size)


def main() -> None:
    page_ids = PAGE_IDS if len(sys.argv) < 2 else sys.argv[1:]
    for page_id in page_ids:
        if has_dump(page_id):
            print("skip", page_id)
            continue
        try:
            for kind, action in (("query", QUERY_ACTION), ("tree", TREE_ACTION)):
                path = RAW / f"{page_id}.{kind}.json"
                if path.exists():
                    continue
                objs = mcp_call(page_id, [action])
                if not objs:
                    raise RuntimeError(f"no object for {page_id} {kind}")
                save_obj(page_id, kind, objs[0])
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError) as e:
            print("fail", page_id, e, file=sys.stderr)
    print("done")


if __name__ == "__main__":
    main()
