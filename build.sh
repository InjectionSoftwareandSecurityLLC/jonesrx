#!/usr/bin/env bash
# Pre-commit build: refresh every generated artefact, then repack the game.
#
#   ./build.sh              full build
#   ./build.sh --fast       skip play-count scraping (slow, network-flaky)
#   ./build.sh --check      report drift, change nothing (exit 1 if stale)
#
# Safe to run repeatedly. Steps that hit third-party APIs keep the previously
# published figure on failure rather than publishing a zero.
set -uo pipefail
cd "$(dirname "$0")"

PY=.venv/bin/python
FAST=0
CHECK=0
for a in "$@"; do
    case "$a" in
        --fast)  FAST=1 ;;
        --check) CHECK=1 ;;
        -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) echo "unknown option: $a" >&2; exit 2 ;;
    esac
done

if [ ! -x "$PY" ]; then
    echo "!! no venv at $PY" >&2
    echo "   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
    exit 1
fi

fail=0
step() { printf '\n\033[36m== %s\033[0m\n' "$1"; }
warn() { printf '\033[33m   %s\033[0m\n' "$1"; }
bad()  { printf '\033[31m   %s\033[0m\n' "$1"; fail=1; }

if [ "$CHECK" = 1 ]; then
    step "catalog drift"
    "$PY" tools/fetch_catalog.py --check || bad "catalog-data.js is stale - run ./build.sh"
    step "packed game sources"
    for src in js/altergame.js js/terminal.js; do
        dat="js/glyph$([ "$src" = js/altergame.js ] && echo 0 || echo 1).dat"
        if [ "$src" -nt "$dat" ]; then bad "$dat older than $src - run ./build.sh"
        else echo "   $dat current"; fi
    done
    [ "$fail" = 0 ] && printf '\n\033[32m== everything current\033[0m\n'
    exit "$fail"
fi

# 1. play counts -------------------------------------------------------
if [ "$FAST" = 1 ]; then
    step "play counts (skipped: --fast)"
elif [ ! -f tools/fetch_plays.py ]; then
    step "play counts"
    warn "tools/fetch_plays.py not present"
else
    step "play counts"
    # the spotify half drives a real browser; without it that source silently reads zero
    if ! "$PY" -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p: p.chromium.launch().close()
" >/dev/null 2>&1; then
        warn "playwright has no browser installed - spotify counts will be skipped"
        warn "fix with:  .venv/bin/playwright install chromium"
    fi
    "$PY" tools/fetch_plays.py || warn "play scrape failed; data/stats-manual.json left as-is"
fi

# 2. catalog + shows played -------------------------------------------
step "catalog, stats and shows"
"$PY" tools/fetch_catalog.py || bad "catalog build failed"

# 3. merch mirror ------------------------------------------------------
step "merch"
"$PY" tools/fetch_merch.py || bad "merch build failed"

# 4. generated art + size manifest ------------------------------------
step "art and size manifest"
"$PY" tools/make_pictures.py || bad "picture build failed"

# 5. the seal payload must survive a regeneration ----------------------
step "seal payload"
if out=$("$PY" tools/embed_seal.py img/angels/uriel.png --verify-only 2>&1); then
    echo "   uriel.png carries $out"
else
    bad "uriel.png has no embedded payload - the steg/exiftool path is broken"
fi

# 6. repack the obfuscated game sources -------------------------------
step "pack game sources"
if [ -f tools/pack.py ]; then
    node -e "new Function(require('fs').readFileSync('js/terminal.js','utf8'))" \
        || bad "js/terminal.js does not parse"
    node -e "new Function(require('fs').readFileSync('js/altergame.js','utf8'))" \
        || bad "js/altergame.js does not parse"
    python3 tools/pack.py || bad "pack failed"
else
    warn "tools/pack.py not present (gitignored) - glyph .dat files unchanged"
fi

# 7. cache-bust anything that changed ----------------------------------
step "cache versions"
"$PY" tools/bump_versions.py || bad "version bump failed"

# 8. sanity ------------------------------------------------------------
step "sanity"
node -e "new Function(require('fs').readFileSync('js/os.js','utf8'))" \
    && echo "   js/os.js parses" || bad "js/os.js does not parse"

if [ "$fail" = 0 ]; then
    printf '\n\033[32m== build clean\033[0m\n'
    git status --short -- index.html js assets data 2>/dev/null | sed 's/^/   /'
else
    printf '\n\033[31m== build finished with errors\033[0m\n'
fi
exit "$fail"
