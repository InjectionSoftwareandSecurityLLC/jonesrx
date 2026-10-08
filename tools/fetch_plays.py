#!/usr/bin/env python3
"""Collect per-track play counts from every source that publishes them.

  soundcloud  public playback_count, server-rendered on each track page
  spotify     only the capped "Popular" list, and only in rendered DOM
  youtube     public view counts via the Data API (needs YOUTUBE_API_KEY
              and YOUTUBE_CHANNEL_ID)

Each source is written separately into data/stats-manual.json under "sources",
so the aggregate stays auditable and any one source can be refreshed alone.
tools/fetch_catalog.py sums them.

    python3 tools/fetch_plays.py                 all available sources
    python3 tools/fetch_plays.py --only soundcloud
    python3 tools/fetch_plays.py --dry-run
"""
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import unicodedata
import urllib.request

PROFILE = "https://soundcloud.com/jonesrx/tracks"
ARTIST_URL = "https://open.spotify.com/artist/159bHbMtw2LRCSPg5gWmh6"
ROOT = pathlib.Path(__file__).resolve().parent.parent
CATALOG = ROOT / "js" / "catalog-data.js"
MANUAL = ROOT / "data" / "stats-manual.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def norm(s):
    # strip producer credits only - a (feat. ...) is part of the track's identity,
    # and removing it collapses "New Low" and "New Low (feat. ...)" into one key
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"\((?:prod|produced)\b[^)]*\)", "", s, flags=re.I)
    s = re.sub(r"\[(?:prod|produced)\b[^\]]*\]", "", s, flags=re.I)
    return re.sub(r"[^a-z0-9]", "", s.lower())


# YouTube titles carry the artist name and a format tag that aren't part of the track
VIDEO_NOISE = re.compile(
    r"\b(?:jones\s*rx|official(?:\s+(?:music)?\s*(?:video|vi[sz]uali[sz]er|audio|lyric\s*video))?"
    r"|vi[sz]uali[sz]er|music\s+video|lyric\s+video|audio\s+only|full\s+video|m/?v)\b",
    re.I)


def yt_norm(title):
    s = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    s = s.replace("/", " ")                   # "MUSIC/LYRIC VIDEO" is one tag, not two
    s = re.sub(r"\((?:prod|produced)\b[^)]*\)", "", s, flags=re.I)
    s = re.sub(r"\[(?:prod|produced)\b[^\]]*\]", "", s, flags=re.I)
    s = VIDEO_NOISE.sub("", s)
    s = re.sub(r"[\(\)\[\]]", "", s)          # brackets left empty by the strips above
    s = re.sub(r"\s*[-|:]\s*", " ", s)        # separators around the removed parts
    return re.sub(r"[^a-z0-9]", "", s.lower())


def load_catalog():
    if not CATALOG.exists():
        sys.exit("js/catalog-data.js missing - run tools/fetch_catalog.py first")
    raw = CATALOG.read_text()
    return json.loads(raw[raw.index("{"):raw.rindex("}") + 1])["tracks"]


def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")


# -- soundcloud -------------------------------------------------------
def sc_track(url):
    """playback_count sits in the server-rendered hydration payload."""
    try:
        html = get(url)
    except Exception:
        return None
    m = re.search(r"window\.__sc_hydration\s*=\s*(\[.*?\]);", html, re.S)
    if not m:
        return None
    found = []

    def walk(n):
        if isinstance(n, dict):
            if n.get("kind") == "track" and n.get("title"):
                found.append(n)
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    try:
        walk(json.loads(m.group(1)))
    except Exception:
        return None
    return found[0] if found else None


def soundcloud(by_key, sources):
    print("soundcloud:")
    try:
        listing = subprocess.run(
            ["yt-dlp", "--no-update", "--flat-playlist",
             "--print", "%(title)s\t%(url)s", PROFILE],
            capture_output=True, text=True, timeout=180).stdout
    except Exception as e:
        print(f"  listing failed ({e})")
        return
    rows = [l.split("\t") for l in listing.strip().splitlines() if "\t" in l]
    if not rows:
        print("  no tracks returned")
        return
    hits = 0
    for title, url in rows:
        slug = by_key.get(norm(title))
        if not slug:
            print(f"  ?? no catalog match: {title}")
            continue
        t = sc_track(url)
        if t is None:
            print(f"  -- {slug}: no payload")
            continue
        n = int(t.get("playback_count") or 0)
        sources.setdefault(slug, {})["soundcloud"] = n
        hits += 1
        print(f"  {n:>9,}  {slug}")
    print(f"  {hits}/{len(rows)} tracks read\n")


# -- spotify ----------------------------------------------------------
def spotify(by_key, sources, totals):
    print("spotify:")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("  playwright not installed - skipping")
        print("  (pip install playwright && playwright install chromium)\n")
        return

    # the artist page sometimes settles with the listener count rendered but the
    # Popular table still empty; retry rather than publish a half-read scrape
    text = ""
    for attempt in range(1, 4):
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(viewport={"width": 1280, "height": 900})
            pg.goto(ARTIST_URL, wait_until="domcontentloaded")
            pg.wait_for_timeout(5500)
            text = pg.inner_text("body")
            b.close()
        start, end = text.find("\nPopular\n"), text.find("Popular releases")
        if start >= 0 and end > start and re.search(r"\n[\d][\d,]*\n", text[start:end]):
            break
        print(f"  attempt {attempt}: page came back without play figures, retrying")
        time.sleep(3)

    m = re.search(r"([\d,.]+)\s*monthly listeners", text, re.I)
    if m:
        totals["monthlyListeners"] = m.group(1)
        print(f"  monthly listeners: {m.group(1)}")

    start, end = text.find("\nPopular\n"), text.find("Popular releases")
    if start < 0 or end <= start:
        print("  Popular section not found - layout may have changed\n")
        return
    tracks, hits = [], 0
    for tok in (t.strip() for t in text[start + 9:end].split("\n")):
        if not tok or tok == "E":
            continue
        if re.fullmatch(r"[\d][\d,]*", tok):
            if tracks:
                tracks[-1]["plays"] = int(tok.replace(",", ""))
        else:
            tracks.append({"name": tok, "plays": 0})
    for t in tracks:
        slug = by_key.get(norm(t["name"]))
        if not slug:
            continue
        # a name with no parseable figure means "unread", not "zero" — writing a 0
        # would publish a play count we never actually measured
        if not t["plays"]:
            print(f"  {'--':>9}  {slug}  (listed, no figure read \u2014 left as-is)")
            continue
        sources.setdefault(slug, {})["spotify"] = t["plays"]
        hits += 1
        print(f"  {t['plays']:>9,}  {slug}")
    print(f"  {hits} of the capped Popular list read\n")


# -- youtube ----------------------------------------------------------
def yt_config():
    """Env vars win; otherwise reuse the key and playlists already in videos.js."""
    key = os.environ.get("YOUTUBE_API_KEY")
    chan = os.environ.get("YOUTUBE_CHANNEL_ID")
    playlists = []
    src = ROOT / "js" / "videos.js"
    if src.exists():
        js = src.read_text()
        if not key:
            m = re.search(r"YT_API_KEY\s*=\s*['\"]([^'\"]+)", js)
            key = m.group(1) if m else None
        block = re.search(r"PLAYLIST_IDS\s*=\s*\[(.*?)\]", js, re.S)
        if block:
            playlists = re.findall(r"['\"]([A-Za-z0-9_\-]{10,})['\"]", block.group(1))
    return key, chan, playlists


def youtube(by_key, sources):
    print("youtube:")
    key, chan, playlists = yt_config()
    if not key:
        print("  no API key found (env or js/videos.js) - skipping\n")
        return
    api = "https://www.googleapis.com/youtube/v3/"
    try:
        if chan and not playlists:
            ch = json.loads(get(f"{api}channels?part=contentDetails&id={chan}&key={key}"))
            playlists = [ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]]
        if not playlists:
            print("  no channel or playlists to read - skipping\n")
            return

        vids = {}
        for pl in playlists:
            page = ""
            while True:
                d = json.loads(get(f"{api}playlistItems?part=snippet&playlistId={pl}"
                                   f"&maxResults=50&key={key}"
                                   + (f"&pageToken={page}" if page else "")))
                for it in d.get("items", []):
                    rid = it["snippet"].get("resourceId", {})
                    if rid.get("kind") == "youtube#video":
                        vids[rid["videoId"]] = it["snippet"]["title"]
                page = d.get("nextPageToken")
                if not page:
                    break

        counts, ids = {}, list(vids)
        for i in range(0, len(ids), 50):
            d = json.loads(get(f"{api}videos?part=statistics&id={','.join(ids[i:i+50])}&key={key}"))
            for v in d.get("items", []):
                counts[v["id"]] = int(v["statistics"].get("viewCount", 0))

        # several uploads can map to one track (video + visualiser + live cut)
        agg, unmatched = {}, []
        for vid, title in vids.items():
            slug = by_key.get(yt_norm(title)) or by_key.get(norm(title))
            if slug:
                agg[slug] = agg.get(slug, 0) + counts.get(vid, 0)
            else:
                unmatched.append((counts.get(vid, 0), title))
        for slug, n in sorted(agg.items(), key=lambda kv: -kv[1]):
            sources.setdefault(slug, {})["youtube"] = n
            print(f"  {n:>9,}  {slug}")
        print(f"  {len(agg)} track(s) matched from {len(vids)} video(s)")
        for n, title in sorted(unmatched, reverse=True)[:8]:
            print(f"  {n:>9,}  (no track match) {title[:52]}")
        print()
    except Exception as e:
        print(f"  lookup failed ({e})\n")


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    dry = "--dry-run" in sys.argv

    catalog = load_catalog()
    by_key = {norm(t["title"]): t["slug"] for t in catalog}

    data = json.loads(MANUAL.read_text()) if MANUAL.exists() else {}
    data.setdefault("totals", {})
    data.setdefault("plays", {})
    sources = data.setdefault("sources", {})

    if only in (None, "soundcloud"):
        soundcloud(by_key, sources)
    if only in (None, "spotify"):
        spotify(by_key, sources, data["totals"])
    if only in (None, "youtube"):
        youtube(by_key, sources)

    # Spotify treats an alias pair as one song, so mirror that component only;
    # the other platforms list them separately and are summed on their own
    for key, target in (data.get("aliases") or {}).items():
        sp = (sources.get(target) or {}).get("spotify")
        if sp:
            sources.setdefault(key, {})["spotify"] = sp
            print(f"alias: {key} takes spotify={sp:,} from {target}")

    graded = []
    for t in catalog:
        s = sources.get(t["slug"]) or {}
        tot = sum(int(s.get(k) or 0) for k in ("spotify", "soundcloud", "youtube"))
        graded.append((tot, t["slug"], s))
    graded.sort(reverse=True)

    print("\naggregate:")
    for tot, slug, s in graded:
        parts = "  ".join(f"{k[:2]}={s.get(k) or 0:,}" for k in ("spotify", "soundcloud", "youtube"))
        print(f"  {tot:>9,}  {slug:<30}{parts}")
    zero = sum(1 for t, _, _ in graded if t == 0)
    print(f"\n  {sum(t for t, _, _ in graded):,} total  |  {zero} track(s) at zero -> '< 1K'")

    if dry:
        print("\n(dry run - nothing written)")
        return 0
    MANUAL.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"\nwrote {MANUAL.relative_to(ROOT)}\nnow run: python3 tools/fetch_catalog.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
