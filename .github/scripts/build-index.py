#!/usr/bin/env python3
"""
Fast index rebuilds:
- Always rebuilds blog/index.json (10 newest in /blog)
- By default, only rebuilds the most recent archive month: old_posts/<latestYYYY>/<latestMM>/index.json
- Set env FULL_REINDEX=1 to rebuild ALL old_posts/**/index.json
"""
import os, re, json, pathlib

ROOT = pathlib.Path(os.getcwd())
BLOG_DIR = ROOT / "blog"
OLD_DIR  = ROOT / "old_posts"

def ensure_dir(p: pathlib.Path): p.mkdir(parents=True, exist_ok=True)

def write_json(p: pathlib.Path, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")

def read_title_from_md(path: pathlib.Path) -> str:
    try:
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("# "):
                    return line[2:].strip()
    except FileNotFoundError:
        pass
    return ""

def collect_posts(base_dir: pathlib.Path):
    posts = []
    if not base_dir.exists():
        return posts
    for name in os.listdir(base_dir):
        if re.match(r"^\d{8}-.*\.md$", name):
            dmy = name[:8]
            dd, mm, yyyy = dmy[0:2], dmy[2:4], dmy[4:8]
            ymd = f"{yyyy}-{mm}-{dd}"
            full = base_dir / name
            posts.append({
                "date": ymd,
                "file": str(full.relative_to(ROOT)).replace("\\", "/"),
                "title": read_title_from_md(full) or name[9:-3]
            })
    posts.sort(key=lambda x: x["date"], reverse=True)
    return posts

def build_blog_index():
    ensure_dir(BLOG_DIR)
    posts = collect_posts(BLOG_DIR)
    write_json(BLOG_DIR / "index.json", posts)

def build_archive_index_for(month_dir: pathlib.Path):
    posts = collect_posts(month_dir)
    write_json(month_dir / "index.json", posts)

def find_latest_archive_month():
    if not OLD_DIR.exists():
        return None
    years = [d for d in OLD_DIR.iterdir() if d.is_dir() and d.name.isdigit()]
    if not years:
        return None
    latest_year = max(years, key=lambda p: int(p.name))
    months = [d for d in latest_year.iterdir() if d.is_dir() and d.name.isdigit()]
    if not months:
        return None
    latest_month = max(months, key=lambda p: int(p.name))
    return latest_month

def build_archive_indexes(full: bool = False):
    if not OLD_DIR.exists():
        return
    if full:
        for yyyy in sorted([d for d in OLD_DIR.iterdir() if d.is_dir() and d.name.isdigit()], key=lambda p: int(p.name)):
            for mm in sorted([d for d in yyyy.iterdir() if d.is_dir() and d.name.isdigit()], key=lambda p: int(p.name)):
                build_archive_index_for(mm)
        return
    latest = find_latest_archive_month()
    if latest:
        build_archive_index_for(latest)

if __name__ == "__main__":
    try:
        import subprocess, sys
        subprocess.run([sys.executable, str(ROOT / ".github" / "scripts_py" / "archive_posts.py")], check=False)
    except Exception:
        pass

    build_blog_index()
    full = os.environ.get("FULL_REINDEX", "").strip() in ("1", "true", "True", "yes")
    build_archive_indexes(full=full)
    mode = "full" if full else "fast"
    print(f"Indexes rebuilt ({mode} mode).")
