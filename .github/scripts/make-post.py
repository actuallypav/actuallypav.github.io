#!/usr/bin/env python3
import os, re, json, sys, pathlib, datetime

EVENT_PATH = os.environ.get("GITHUB_EVENT_PATH")
if not EVENT_PATH or not os.path.exists(EVENT_PATH):
    print("GITHUB_EVENT_PATH not found.", file=sys.stderr)
    sys.exit(1)

with open(EVENT_PATH, "r", encoding="utf-8") as f:
    event = json.load(f)

issue = event.get("issue", {}) or {}
title = (issue.get("title") or "Untitled").strip()
body  = (issue.get("body")  or "").strip()

now = datetime.datetime.now()
dd = f"{now.day:02d}"
mm = f"{now.month:02d}"
yyyy = f"{now.year:04d}"
ddmmyyyy = f"{dd}{mm}{yyyy}"

slug = re.sub(r"[^a-zA-Z0-9 -]", "", title).strip().lower()
slug = re.sub(r"\s+", "-", slug) or "post"

rel_dir = "blog"
pathlib.Path(rel_dir).mkdir(parents=True, exist_ok=True)

base_name = f"{ddmmyyyy}-{slug}.md"
rel_path = os.path.join(rel_dir, base_name)
counter = 2
while os.path.exists(rel_path):
    rel_path = os.path.join(rel_dir, f"{ddmmyyyy}-{slug}-{counter}.md")
    counter += 1

content = f"# {title}\n\n{body}\n"
with open(rel_path, "w", encoding="utf-8") as f:
    f.write(content)

out = os.environ.get("GITHUB_OUTPUT")
if out:
    with open(out, "a", encoding="utf-8") as f:
        f.write(f"path={rel_path}\n")
        f.write(f"title={title}\n")
        f.write(f"date={ddmmyyyy}\n")

print(f"Created {rel_path}")