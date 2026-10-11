#!/usr/bin/env python3
"""Rewrite every ?v= cache-buster to a short hash of the file's own contents.

Hand-incremented integers drift: it is easy to change a file and forget, which
serves a stale asset, and easy to bump one that did not change, which busts a
cache for nothing. A content hash is correct by construction.
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "events.html", "videos.html", "about.html"]

# href="css/os.css?v=31"  src="js/os.js?v=31"  _get('js/glyph0.dat?v=43')
REF = re.compile(r"""(?P<path>(?:js|css|assets)/[A-Za-z0-9._/-]+?)\?v=(?P<ver>[A-Za-z0-9.]+)""")


def digest(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


def main():
    check = "--check" in sys.argv
    changed = total = missing = 0

    for name in PAGES:
        page = ROOT / name
        if not page.exists():
            continue
        text = page.read_text()
        originals = {}

        def sub(m):
            nonlocal changed, total, missing
            rel, old = m.group("path"), m.group("ver")
            target = ROOT / rel
            if not target.exists():
                missing += 1
                originals.setdefault(rel, "missing")
                return m.group(0)
            total += 1
            new = digest(target)
            if new != old:
                changed += 1
                originals[rel] = f"{old} -> {new}"
            return f"{rel}?v={new}"

        out = REF.sub(sub, text)
        for rel, note in sorted(originals.items()):
            if note == "missing":
                print(f"   !! {rel} referenced but not on disk")
            else:
                print(f"   {rel}  {note}")
        if out != text and not check:
            page.write_text(out)

    if check and changed:
        print(f"   {changed} of {total} cache-busters stale")
        return 1
    print(f"   {total} refs checked, {changed} rewritten"
          + (f", {missing} missing" if missing else ""))
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
