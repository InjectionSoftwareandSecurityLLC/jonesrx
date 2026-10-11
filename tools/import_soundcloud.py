#!/usr/bin/env python3
"""Pull the published catalog off SoundCloud into assets/catalog/<slug>.mp3.

Requires downloads to be enabled on the tracks (Track settings -> Metadata ->
"Enable downloads"). With it on, SoundCloud serves the original uploaded file and
yt-dlp exposes a `download` format. With it off, only 128k stream transcodes exist
and this script refuses unless you pass --allow-transcode.

Filenames are matched to the slugs in js/catalog-data.js so the site picks them up
with no further wiring.

  python3 tools/import_soundcloud.py --dry-run     show the title -> slug mapping
  python3 tools/import_soundcloud.py               download what's missing
  python3 tools/import_soundcloud.py --force       re-download everything
"""
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

PROFILE = "https://soundcloud.com/jonesrx/tracks"
ROOT = pathlib.Path(__file__).resolve().parent.parent
CATALOG = ROOT / "js" / "catalog-data.js"
OUT_DIR = ROOT / "assets" / "catalog"


def norm(s):
    """Collapse a title to a comparison key: no accents, prod credits, or punctuation."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"\((?:prod|produced)\b[^)]*\)", "", s, flags=re.I)
    s = re.sub(r"\[(?:prod|produced)\b[^\]]*\]", "", s, flags=re.I)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def load_catalog():
    if not CATALOG.exists():
        sys.exit("js/catalog-data.js missing - run tools/fetch_catalog.py first")
    raw = CATALOG.read_text()
    data = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])
    return data["tracks"]


def yt(args):
    r = subprocess.run(["yt-dlp", "--no-update", *args],
                       capture_output=True, text=True)
    if r.returncode != 0 and not r.stdout:
        sys.exit(f"yt-dlp failed:\n{r.stderr.strip()[:400]}")
    return r.stdout


def main():
    dry = "--dry-run" in sys.argv
    force = "--force" in sys.argv
    allow_transcode = "--allow-transcode" in sys.argv

    tracks = load_catalog()
    by_key = {norm(t["title"]): t for t in tracks}

    listing = yt(["--flat-playlist", "--print", "%(id)s\t%(title)s\t%(url)s", PROFILE])
    rows = [l.split("\t") for l in listing.strip().splitlines() if l.count("\t") == 2]
    if not rows:
        sys.exit("no tracks returned from SoundCloud")

    plan, unmatched = [], []
    for _id, title, url in rows:
        t = by_key.get(norm(title))
        (plan.append((title, t["slug"], url)) if t else unmatched.append(title))

    print(f"{len(plan)}/{len(rows)} SoundCloud tracks matched to catalog slugs")
    for title, sl, _ in plan:
        have = (OUT_DIR / f"{sl}.mp3").exists()
        print(f"  {'have' if have else '--  '} {sl + '.mp3':<34}{title}")
    for title in unmatched:
        print(f"  ??   (no catalog match)              {title}")
    missing = [t["slug"] for t in tracks if norm(t["title"]) not in {norm(r[1]) for r in rows}]
    for sl in missing:
        print(f"  !!   not on SoundCloud               {sl}")

    if dry:
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    got = 0
    for title, sl, url in plan:
        dest = OUT_DIR / f"{sl}.mp3"
        if dest.exists() and not force:
            continue
        fmts = yt(["--list-formats", url])
        has_original = re.search(r"^download\s", fmts, re.M) is not None
        if not has_original and not allow_transcode:
            print(f"\n  skip {sl}: downloads not enabled (only 128k transcodes offered)")
            continue
        # the uploads are already MP3, so prefer SoundCloud's MP3 stream and let
        # ffmpeg stream-copy it rather than re-encoding the AAC transcode
        fmt = "download" if has_original else "http_mp3_1_0/hls_mp3_1_0/bestaudio"
        print(f"\n  fetching {sl} [{'original' if has_original else 'mp3 stream'}]")
        subprocess.run(["yt-dlp", "--no-update", "-f", fmt,
                        "-x", "--audio-format", "mp3", "--audio-quality", "0",
                        "-o", str(OUT_DIR / f"{sl}.%(ext)s"), url])
        if dest.exists():
            got += 1

    print(f"\n{got} file(s) written to {OUT_DIR.relative_to(ROOT)}")
    if got:
        print("now run: python3 tools/fetch_catalog.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
