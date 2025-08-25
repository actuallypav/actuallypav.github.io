#!/usr/bin/env python3
"""
Keep the 10 newest posts in /blog (by filename date DDMMYYYY-*.md) and move older
ones to /old_posts/YYYY/MM/.
"""
import os, re, sys, shutil, pathlib

BLOG_DIR = "blog"
ARCHIVE_ROOT = "old_posts"

if not os.path.exists(BLOG_DIR):
    sys.exit(0)

entries = []
for name in os.listdir(BLOG_DIR):
    if re.match(r"^\d{8}-.*\.md$", name):
        dmy = name[:8]
        dd, mm, yyyy = dmy[0:2], dmy[2:4], dmy[4:8]
        ymd = f"{yyyy}{mm}{dd}"
        entries.append({"name": name, "yyyy": yyyy, "mm": mm, "ymd": ymd})

entries.sort(key=lambda e: e["ymd"], reverse=True)
to_move = entries[10:]

for e in to_move:
    src = os.path.join(BLOG_DIR, e["name"])
    dest_dir = os.path.join(ARCHIVE_ROOT, e["yyyy"], e["mm"])
    pathlib.Path(dest_dir).mkdir(parents=True, exist_ok=True)
    dest = os.path.join(dest_dir, e["name"])
    if os.path.exists(src):
        shutil.move(src, dest)
        print(f"Moved {src} -> {dest}")
