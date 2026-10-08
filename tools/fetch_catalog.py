#!/usr/bin/env python3
"""Rebuild js/catalog-data.js.

Sources, in order of how much they can be trusted:

  iTunes Lookup API  - open, no credentials. Titles, albums, years, durations, art.
  Spotify Web API    - optional. Set SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET to add
                       direct Spotify links and the 0-100 popularity score.
                       Spotify does NOT expose play counts through its API.
  YouTube Data API   - optional. Set YOUTUBE_API_KEY (+ YOUTUBE_CHANNEL_ID) to add
                       public view counts for tracks that have a video.

Play counts and headline totals are NOT scraped. Apple publishes none at all, and
Spotify's are only rendered by its private web endpoints. Put real figures in
data/stats-manual.json (your distributor dashboard aggregates every platform and is
the accurate source); they are merged here and never overwritten.

  python3 tools/fetch_catalog.py           rebuild
  python3 tools/fetch_catalog.py --slugs   list expected assets/catalog/*.mp3 names
  python3 tools/fetch_catalog.py --check   exit 1 if the output would change
"""
import base64
import datetime
import json
import os
import pathlib
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

ARTIST_ID = "1776303110"
SPOTIFY_ARTIST = "159bHbMtw2LRCSPg5gWmh6"
BIT_ARTIST = "id_15564526"                              # the name endpoint serves a stale cache
BIT_APP_ID = "26113258b4b0ab3265bf61cdb27edeab"      # same id the events page uses
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "catalog-data.js"
MANUAL = ROOT / "data" / "stats-manual.json"
AUDIO_DIR = ROOT / "assets" / "catalog"


def fetch(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "jonesrx-site-build/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def itunes(entity):
    return fetch(f"https://itunes.apple.com/lookup?id={ARTIST_ID}&entity={entity}&limit=200")["results"]


# -- shows played, via Bandsintown -------------------------------------
def previous_shows():
    """The figure already published, so a failed lookup can fall back to it."""
    if not OUT.exists():
        return None
    m = re.search(r'"showsPlayed":\s*(\d+)', OUT.read_text())
    return int(m.group(1)) if m else None


def shows_played(previous):
    """Count past events. On any failure keep the last known figure rather than
    publishing a zero, since this runs unattended from CI."""
    url = ("https://rest.bandsintown.com/artists/"
           + urllib.parse.quote(BIT_ARTIST)
           + f"/events?app_id={BIT_APP_ID}&date=past")
    try:
        events = fetch(url, timeout=25)
    except Exception as e:
        print(f"  bandsintown: lookup failed ({e}); keeping {previous or 'none'}")
        return previous
    if not isinstance(events, list):
        print(f"  bandsintown: unexpected payload; keeping {previous or 'none'}")
        return previous
    today = datetime.date.today().isoformat()
    played = [e for e in events if str(e.get("datetime", ""))[:10] <= today]
    print(f"  bandsintown: {len(played)} past shows")
    return len(played)


def slug(s):
    # strip accents first, or "Patrón" becomes "patr-n" and never matches the stats key
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.lower().replace("&", "and")
    s = re.sub(r"[\u2018\u2019']", "", s)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def norm(s):
    """Loose key for matching titles across services."""
    s = s.lower()
    s = re.sub(r"\(feat[^)]*\)|\[feat[^\]]*\]", "", s)
    s = re.sub(r"\s*-\s*(single|ep)$", "", s)
    return re.sub(r"[^a-z0-9]", "", s)


def hi_res(url, size=600):
    return re.sub(r"/\d+x\d+bb\.(jpg|png)$", f"/{size}x{size}bb.\\1", url or "")


# -- optional: Spotify links + popularity -----------------------------
def spotify_enrich(tracks, releases):
    cid, secret = os.environ.get("SPOTIFY_CLIENT_ID"), os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not (cid and secret):
        print("  spotify: no credentials, falling back to search links")
        return
    try:
        basic = base64.b64encode(f"{cid}:{secret}".encode()).decode()
        req = urllib.request.Request(
            "https://accounts.spotify.com/api/token",
            data=b"grant_type=client_credentials",
            headers={"Authorization": f"Basic {basic}",
                     "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=30) as r:
            token = json.loads(r.read().decode())["access_token"]
        H = {"Authorization": f"Bearer {token}"}

        albums = {}
        url = (f"https://api.spotify.com/v1/artists/{SPOTIFY_ARTIST}"
               "/albums?include_groups=album,single&limit=50")
        while url:
            page = fetch(url, H)
            for a in page["items"]:
                albums[norm(a["name"])] = a
            url = page.get("next")

        sp_tracks = {}
        for a in albums.values():
            for t in fetch(f"https://api.spotify.com/v1/albums/{a['id']}/tracks?limit=50", H)["items"]:
                sp_tracks[norm(t["name"])] = t["id"]

        pop, ids = {}, list(sp_tracks.values())
        for i in range(0, len(ids), 50):
            for t in fetch(f"https://api.spotify.com/v1/tracks?ids={','.join(ids[i:i+50])}", H)["tracks"]:
                if t:
                    pop[t["id"]] = t.get("popularity")

        hits = 0
        for t in tracks:
            tid = sp_tracks.get(norm(t["title"]))
            if tid:
                t["spotifyUrl"] = f"https://open.spotify.com/track/{tid}"
                t["popularity"] = pop.get(tid)
                hits += 1
        for r in releases:
            a = albums.get(norm(r["title"]))
            if a:
                r["spotifyUrl"] = a["external_urls"]["spotify"]
        print(f"  spotify: matched {hits}/{len(tracks)} tracks, "
              f"{sum(1 for r in releases if r['spotifyUrl'])}/{len(releases)} releases")
    except Exception as e:
        print(f"  spotify: enrichment failed ({e}); falling back to search links")


def main():
    songs = [r for r in itunes("song") if r.get("wrapperType") == "track"]
    albums = [r for r in itunes("album") if r.get("wrapperType") == "collection"]

    manual = json.loads(MANUAL.read_text()) if MANUAL.exists() else {}
    plays, totals = manual.get("plays", {}), manual.get("totals", {})
    sources = manual.get("sources", {})
    # Spotify treats an alias pair as one song; mirror only that component
    for key, target in (manual.get("aliases") or {}).items():
        sp = (sources.get(target) or {}).get("spotify")
        if sp:
            sources.setdefault(key, {})["spotify"] = sp

    PLATFORMS = ("spotify", "soundcloud", "youtube")

    def play_total(sl):
        """Hand-entered figure wins; otherwise sum every platform we could read."""
        if plays.get(sl):
            return plays[sl], {}
        s = sources.get(sl) or {}
        breakdown = {k: int(s.get(k) or 0) for k in PLATFORMS if s.get(k)}
        tot = sum(breakdown.values())
        return (str(tot) if tot else ""), breakdown

    tracks = []
    for s in songs:
        name = s.get("trackName", "")
        sl, ms = slug(name), (s.get("trackTimeMillis") or 0)
        total, breakdown = play_total(sl)
        tracks.append({
            "slug": sl,
            "title": name,
            "album": re.sub(r"\s*-\s*(Single|EP)$", "", s.get("collectionName", "")),
            "year": (s.get("releaseDate") or "")[:4],
            "released": (s.get("releaseDate") or "")[:10],
            "durationMs": ms,
            "duration": f"{ms // 60000}:{ms // 1000 % 60:02d}" if ms else "",
            "art": hi_res(s.get("artworkUrl100", "")),
            "disc": s.get("discNumber") or 1,
            "trackNumber": s.get("trackNumber") or 0,
            "appleUrl": s.get("trackViewUrl", ""),
            "spotifyUrl": "",
            "popularity": None,
            "plays": total,
            "playSources": breakdown,
            # set once the artist drops their own master in assets/catalog/
            "local": f"assets/catalog/{sl}.mp3" if (AUDIO_DIR / f"{sl}.mp3").exists() else "",
        })
    # stable two-pass: newest release first, but album order within each release
    tracks.sort(key=lambda t: (t["disc"], t["trackNumber"]))
    tracks.sort(key=lambda t: t["released"] or "", reverse=True)

    releases = []
    for a in albums:
        raw = a.get("collectionName", "")
        releases.append({
            "slug": slug(raw),
            "title": re.sub(r"\s*-\s*(Single|EP)$", "", raw),
            "kind": "EP" if "- EP" in raw else "Single" if "- Single" in raw else "Album",
            "year": (a.get("releaseDate") or "")[:4],
            "released": (a.get("releaseDate") or "")[:10],
            "trackCount": a.get("trackCount", 0),
            "art": hi_res(a.get("artworkUrl100", "")),
            "appleUrl": a.get("collectionViewUrl", ""),
            "spotifyUrl": "",
        })
    releases.sort(key=lambda r: r["released"] or "", reverse=True)

    spotify_enrich(tracks, releases)

    for r in releases:                     # anything unmatched still gets a usable link
        if not r["spotifyUrl"]:
            q = urllib.parse.quote(f"{r['title']} Jones RX")
            r["spotifyUrl"] = f"https://open.spotify.com/search/{q}"

    if "--slugs" in sys.argv:
        print(f"\nDrop masters in {AUDIO_DIR.relative_to(ROOT)}/ using these names:\n")
        for t in tracks:
            print(f"  {'ok ' if t['local'] else '   '}{t['slug'] + '.mp3':<38}{t['title']}")
        return 0

    years = sorted({t["year"] for t in tracks if t["year"]})
    # derive the cross-platform total unless a figure was entered by hand
    scraped_total = sum(sum(t["playSources"].values()) for t in tracks)
    streams = totals.get("streams") or (f"{scraped_total:,}" if scraped_total else "")
    top = totals.get("topTrack", "")
    if not top:
        best = max(tracks, key=lambda t: sum(t["playSources"].values()), default=None)
        if best and sum(best["playSources"].values()):
            top = f"{best['title']} \u00b7 {sum(best['playSources'].values()):,}"
    payload = {
        "generated": True,
        "artist": "Jones RX",
        "tracks": tracks,
        "releases": releases,
        "stats": {
            "trackCount": len(tracks),
            "releaseCount": len(releases),
            "firstYear": years[0] if years else "",
            "latestYear": years[-1] if years else "",
            "streams": streams,
            "monthlyListeners": totals.get("monthlyListeners", ""),
            "topTrack": top,
            "showsPlayed": shows_played(previous_shows()),
        },
    }
    out = ("/* GENERATED by tools/fetch_catalog.py \u2014 do not edit by hand.\n"
           "   Play counts and totals come from data/stats-manual.json. */\n"
           f"window.CATALOG = {json.dumps(payload, indent=2, ensure_ascii=False)};\n")

    if "--check" in sys.argv:
        if (OUT.read_text() if OUT.exists() else "") != out:
            print("catalog-data.js is out of date")
            return 1
        print("catalog-data.js is current")
        return 0

    OUT.write_text(out)
    have = sum(1 for t in tracks if t["local"])
    print(f"wrote {OUT.relative_to(ROOT)} \u2014 {len(tracks)} tracks, "
          f"{len(releases)} releases, {have} with local audio")
    return 0


if __name__ == "__main__":
    sys.exit(main())
