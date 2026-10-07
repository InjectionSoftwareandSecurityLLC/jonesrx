#!/usr/bin/env python3
"""Pack core game sources into double base32-encoded .dat blobs.

Keep the raw js/altergame.js and js/terminal.js local (gitignored); commit the
generated .dat files. Re-run after editing either source file.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (source, encoded output)
FILES = [
    ("js/altergame.js", "js/glyph0.dat"),
    ("js/terminal.js",  "js/glyph1.dat"),
]


def pack(src, out):
    with open(os.path.join(ROOT, src), "rb") as f:
        data = f.read()
    enc = base64.b32encode(base64.b32encode(data))
    with open(os.path.join(ROOT, out), "wb") as f:
        f.write(enc)
    print(f"packed {src} -> {out} ({len(enc)} bytes)")


if __name__ == "__main__":
    for src, out in FILES:
        pack(src, out)
