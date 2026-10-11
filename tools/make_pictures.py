#!/usr/bin/env python3
"""Render the Pictures gallery: themed sigils and hexagrams, plus rainbow GIFs.

The hexagram geometry mirrors sigilPath() in js/os.js so the downloadable art
matches what floats through the visualizer. Sigils are recoloured from the
artist's own PNGs by using their alpha as a mask.

    python3 tools/make_pictures.py
"""
import math
import pathlib

from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
ANGEL_SRC = ROOT / "img" / "angels"
OUT = ROOT / "assets" / "pictures"

SIZE = 512
ANGELS = ["raphael", "michael", "gabriel", "uriel"]
SHAPES = ["star", "stack", "diamond", "hourglass", "pentacle"]
THEMES = {
    "cyan": "#00f0ff",
    "raphael": "#ffd400",
    "michael": "#ff2d2d",
    "gabriel": "#2d7bff",
    "uriel": "#1fd882",
    "white": "#ffffff",
}
GIF_FRAMES = 24
GIF_MS = 70


def hexc(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def hsv(h):
    """h in [0,1) -> rgb tuple, full saturation and value."""
    i = int(h * 6) % 6
    f = h * 6 - int(h * 6)
    q, t = int(255 * (1 - f)), int(255 * f)
    return [(255, t, 0), (q, 255, 0), (0, 255, t),
            (0, q, 255), (t, 0, 255), (255, 0, q)][i]


# ── hexagram geometry, mirroring js/os.js sigilPath() ──────────────
def tri(half_w, apex_y, base_y):
    return [(0, apex_y), (-half_w, base_y), (half_w, base_y)]


def shape_paths(kind, r):
    """Returns (polylines, circles) in centre-origin coordinates."""
    polys, circles = [], []
    if kind == "star":
        for t in range(2):
            pts = []
            for i in range(3):
                a = -math.pi / 2 + t * math.pi + i * (math.pi * 2 / 3)
                pts.append((math.cos(a) * r, math.sin(a) * r))
            polys.append(pts)
        # no enclosing circle: the altar frame's corner is two bare triangles
    elif kind == "stack":
        polys.append(tri(r * 0.85, -r, r * 0.33))
        polys.append(tri(r * 0.85, -r * 0.33, r))
    elif kind == "diamond":
        polys.append(tri(r * 0.78, -r, 0))
        polys.append(tri(r * 0.78, r, 0))
    elif kind == "hourglass":
        polys.append(tri(r * 0.95, 0, -r))
        polys.append(tri(r * 0.95, 0, r))
    else:                                   # pentacle
        pts = []
        for i in range(6):
            a = -math.pi / 2 + (i * 2 % 5) * (math.pi * 2 / 5)
            pts.append((math.cos(a) * r, math.sin(a) * r))
        polys.append(pts)
        circles.append(r)
    return polys, circles


def draw_hexagram(kind, rgb, size=SIZE):
    """Line art with a soft glow, on transparency."""
    cx = cy = size / 2
    r = size * 0.33
    width = max(2, size // 128)

    line = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(line)
    polys, circles = shape_paths(kind, r)
    for pts in polys:
        pts = [(cx + x, cy + y) for x, y in pts]
        d.line(pts + [pts[0]], fill=rgb + (255,), width=width, joint="curve")
    for rad in circles:
        d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad],
                  outline=rgb + (255,), width=width)

    glow = line.filter(ImageFilter.GaussianBlur(size / 64))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out = Image.alpha_composite(out, glow)
    out = Image.alpha_composite(out, glow)      # twice, for a hotter core
    return Image.alpha_composite(out, line)


# ── sigils: recolour the artist's own art through its alpha ────────
def tint(src, rgb):
    base = src.convert("RGBA")
    # the art is light-on-transparent; use luminance * alpha as the mask so
    # strokes keep their softness instead of flattening to a silhouette
    lum = base.convert("L")
    alpha = base.getchannel("A")
    mask = Image.composite(lum, Image.new("L", base.size, 0), alpha)
    solid = Image.new("RGBA", base.size, rgb + (255,))
    solid.putalpha(mask)
    glow = solid.filter(ImageFilter.GaussianBlur(base.size[0] / 90))
    out = Image.new("RGBA", base.size, (0, 0, 0, 0))
    out = Image.alpha_composite(out, glow)
    return Image.alpha_composite(out, solid)


# ── album art in a frame, echoing the altar's ornate border ────────
def framed(cover, rgb, size=640):
    pad = int(size * 0.14)
    art = size - pad * 2
    out = Image.new("RGBA", (size, size), (6, 7, 14, 255))
    inner = cover.convert("RGBA").resize((art, art), Image.LANCZOS)
    out.paste(inner, (pad, pad), inner)

    d = ImageDraw.Draw(out)
    w = max(2, size // 220)
    dim = tuple(int(c * 0.55) for c in rgb)
    # three nested rules, the way the altar frame is built up
    for i, (off, col, wid) in enumerate([
        (int(pad * 0.30), dim, w), (int(pad * 0.52), rgb, w * 2), (pad - w, rgb, w)
    ]):
        d.rectangle([off, off, size - off - 1, size - off - 1],
                    outline=col + (255,), width=wid)

    # corner hexagrams, matching the four variants on the altar frame
    r = pad * 0.42
    for (cx, cy), kind in zip(
        [(pad * 0.62, pad * 0.62), (size - pad * 0.62, pad * 0.62),
         (pad * 0.62, size - pad * 0.62), (size - pad * 0.62, size - pad * 0.62)],
        ["stack", "star", "diamond", "hourglass"]
    ):
        polys, circles = shape_paths(kind, r)
        for pts in polys:
            pts = [(cx + x, cy + y) for x, y in pts]
            d.line(pts + [pts[0]], fill=rgb + (255,), width=w, joint="curve")
        for rad in circles:
            d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad],
                      outline=rgb + (255,), width=w)

    glow = out.filter(ImageFilter.GaussianBlur(size / 150))
    return Image.alpha_composite(glow, out)


def save_gif(frames, path):
    flat = [f.convert("RGBA") for f in frames]
    bg = Image.new("RGBA", flat[0].size, (4, 5, 10, 255))
    merged = [Image.alpha_composite(bg, f).convert("RGB") for f in flat]
    # the palette has to be derived from every frame: quantizing against frame
    # zero alone crushes the whole cycle into that first hue
    w, h = merged[0].size
    strip = Image.new("RGB", (w, h * len(merged)))
    for i, m in enumerate(merged):
        strip.paste(m, (0, h * i))
    pal = strip.quantize(colors=255, method=Image.MEDIANCUT)
    seq = [m.quantize(palette=pal, dither=Image.NONE) for m in merged]
    seq[0].save(path, save_all=True, append_images=seq[1:],
                duration=GIF_MS, loop=0, optimize=False)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0

    for shape in SHAPES:
        for name, hexv in THEMES.items():
            img = draw_hexagram(shape, hexc(hexv))
            img.save(OUT / f"hexagram_{shape}_{name}.png")
            made += 1
        frames = [draw_hexagram(shape, hsv(i / GIF_FRAMES), 256)
                  for i in range(GIF_FRAMES)]
        save_gif(frames, OUT / f"hexagram_{shape}_rainbow.gif")
        made += 1

    for angel in ANGELS:
        src_path = ANGEL_SRC / f"{angel}.png"
        if not src_path.exists():
            print(f"  !! missing {src_path}")
            continue
        src = Image.open(src_path)
        small = src.copy()
        small.thumbnail((256, 256))
        for name, hexv in THEMES.items():
            tint(src, hexc(hexv)).save(OUT / f"{angel}_{name}.png")
            made += 1
        frames = [tint(small, hsv(i / GIF_FRAMES)) for i in range(GIF_FRAMES)]
        save_gif(frames, OUT / f"{angel}_rainbow.gif")
        made += 1

    cover_path = ROOT / "img" / "alter_album_art.png"
    if cover_path.exists():
        cover = Image.open(cover_path)
        for name, hexv in THEMES.items():
            framed(cover, hexc(hexv)).save(OUT / f"alter_framed_{name}.png")
            made += 1
        frames = [framed(cover, hsv(i / GIF_FRAMES), 320) for i in range(GIF_FRAMES)]
        save_gif(frames, OUT / "alter_framed_rainbow.gif")
        made += 1
    else:
        print(f"  !! missing {cover_path}")

    total = sum(p.stat().st_size for p in OUT.iterdir())
    write_manifest()
    print(f"wrote {made} files to {OUT.relative_to(ROOT)} "
          f"({total / 1048576:.1f} MB)")


def write_manifest():
    """Real byte sizes, so the in-game `ls -l` matches what actually downloads."""
    sizes = {p.name: p.stat().st_size
             for p in sorted(OUT.iterdir()) if p.is_file()}
    for extra in (ROOT / "img" / "alter_album_art.png",
                  *(ANGEL_SRC / f"{a}.png" for a in ANGELS)):
        if extra.exists():
            sizes[extra.name] = extra.stat().st_size
    body = ",".join(f'"{k}":{v}' for k, v in sizes.items())
    dest = ROOT / "js" / "pixsizes.js"
    dest.write_text(
        "// generated by tools/make_pictures.py - do not edit by hand\n"
        f"window.ALTERPIX={{{body}}};\n")
    print(f"  manifest: {dest.relative_to(ROOT)} ({len(sizes)} entries)")


if __name__ == "__main__":
    main()
