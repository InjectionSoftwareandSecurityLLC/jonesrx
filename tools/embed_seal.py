#!/usr/bin/env python3
"""Embed a payload into a PNG as a tEXt chunk, so offline tools (exiftool,
strings, pngcheck) surface the same string the in-game `steg` command yields.

The payload is passed on the command line and never stored in this file.

    python3 tools/embed_seal.py img/angels/uriel.png --keyword Comment --payload '<base64>'
"""
import argparse
import pathlib
import struct
import zlib

SIG = b"\x89PNG\r\n\x1a\n"


def chunks(data: bytes):
    """Yield (type, payload) for each chunk after the signature."""
    pos = len(SIG)
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        ctype = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + length]
        yield ctype, body
        pos += 12 + length


def build(ctype: bytes, body: bytes) -> bytes:
    return (struct.pack(">I", len(body)) + ctype + body
            + struct.pack(">I", zlib.crc32(ctype + body) & 0xFFFFFFFF))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--keyword", default="Comment")
    ap.add_argument("--payload")
    ap.add_argument("--verify-only", action="store_true")
    args = ap.parse_args()
    if not args.verify_only and args.payload is None:
        ap.error("--payload is required unless --verify-only is given")

    path = pathlib.Path(args.image)
    raw = path.read_bytes()
    if not raw.startswith(SIG):
        raise SystemExit(f"{path}: not a PNG")

    kw = args.keyword.encode("latin-1")
    if args.verify_only:
        for ctype, body in chunks(raw):
            if ctype == b"tEXt" and body.split(b"\x00", 1)[0] == kw:
                print(body.split(b"\x00", 1)[1].decode("latin-1"))
                return
        raise SystemExit(f"no tEXt chunk with keyword {args.keyword!r}")

    out = bytearray(SIG)
    inserted = False
    for ctype, body in chunks(raw):
        # drop a previous chunk with the same keyword so re-running is idempotent
        if ctype == b"tEXt" and body.split(b"\x00", 1)[0] == kw:
            continue
        # must precede IDAT: readers like PIL ignore text chunks found after it
        if ctype == b"IDAT" and not inserted:
            out += build(b"tEXt", kw + b"\x00" + args.payload.encode("latin-1"))
            inserted = True
        out += build(ctype, body)
    if not inserted:
        raise SystemExit(f"{path}: no IDAT chunk found")

    path.write_bytes(bytes(out))
    print(f"{path}: embedded {len(args.payload)} bytes under {args.keyword!r} "
          f"({len(raw)} -> {len(out)} bytes)")


if __name__ == "__main__":
    main()
