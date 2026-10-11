"""Validate the demo SRTs the same way js/os.js parseSRT does."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "tracks"


def secs(t):
    m = re.search(r"(\d+):(\d+):(\d+)[,.](\d+)", t)
    if not m:
        return None
    return int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) + int(m[4]) / 1000


def parse(text):
    """Mirrors the JS: split on blank lines, find the --> line, join the rest."""
    cues, dropped = [], []
    blocks = text.replace("\r", "").split("\n\n")
    for b in blocks:
        lines = [l for l in b.split("\n") if l.strip() != ""]
        if not lines:
            continue
        at = next((i for i, l in enumerate(lines) if "-->" in l), None)
        if at is None:
            if lines:
                dropped.append(("no timestamp", " ".join(lines)[:48]))
            continue
        a, z = lines[at].split("-->")
        start, end = secs(a), secs(z)
        body = " ".join(lines[at + 1:]).strip()
        if start is None or end is None:
            dropped.append(("bad timestamp", lines[at][:48]))
        elif not body:
            dropped.append(("empty body", lines[at][:48]))
        else:
            cues.append((start, end, body))
    return cues, dropped


print(f"{'file':14}{'raw':>5}{'ok':>5}{'drop':>6}{'last':>9}  issues")
for p in sorted(SRC.glob("*.srt")):
    text = p.read_text(encoding="utf-8-sig")
    raw = text.count("-->")
    cues, dropped = parse(text)
    issues = []
    if dropped:
        issues.append(f"{len(dropped)} dropped")
    order = [c for i, c in enumerate(cues) if i and c[0] < cues[i - 1][0]]
    if order:
        issues.append(f"{len(order)} out of order")
    bad = [c for c in cues if c[1] <= c[0]]
    if bad:
        issues.append(f"{len(bad)} non-positive span")
    overlaps = [(cues[i - 1], c) for i, c in enumerate(cues) if i and c[0] < cues[i - 1][1]]
    if overlaps:
        issues.append(f"{len(overlaps)} overlap")
    flash = [c for c in cues if 0 < c[1] - c[0] < 0.30]
    if flash:
        issues.append(f"{len(flash)} under 0.3s")
    last = cues[-1][1] if cues else 0
    print(f"{p.name:14}{raw:5}{len(cues):5}{len(dropped):6}{last:8.1f}s  "
          + (", ".join(issues) if issues else "clean"))
    for why, what in dropped[:4]:
        print(f"                 ! {why}: {what}")
    for a, b in overlaps[:4]:
        print(f"                 ! overlap: {a[0]:.2f}-{a[1]:.2f} then {b[0]:.2f} \"{b[2][:28]}\"")
    for c in flash[:4]:
        print(f"                 ! {c[1]-c[0]:.2f}s \"{c[2][:34]}\"")
