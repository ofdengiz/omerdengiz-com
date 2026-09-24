"""
Generate the og:image (1200x630 PNG) that shows up when the site is pasted
into LinkedIn, Slack, Discord or a chat client.

This card is the most-shared representation of the site, and for a while it
was the least accurate one. The previous version predated the Blueprint x
Editorial redesign and still carried its own aesthetic (violet/cyan gradient,
orbital rings), printed the apex domain that no longer resolves, and stated
the AWS certification with no validity window, which is a stronger claim than
the site or the resume makes anywhere else.

It is now drawn as a title block, the same primitive the site uses on every
page: warm paper, hairline rules, ink in three weights, one accent. Type comes
from the site's own webfonts rather than a system substitute, converted from
woff2 on the fly so there is no second copy of a font to fall out of date.

Output: public/assets/og.png
Run:    python scripts/generate_og.py
"""

from __future__ import annotations

import io
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "og.png"
FONTS = ROOT / "node_modules"

W, H = 1200, 630
M = 64          # sheet margin
GUT = 26        # inner gutter between the frame and its contents

# Light-theme values from src/styles/tokens.css. Kept as literals rather than
# parsed: the card is generated rarely, and a parser for light-dark() would be
# more code than the six colours it would resolve.
PAPER = (245, 244, 240)     # --paper
PAPER_3 = (228, 225, 216)   # --paper-3
INK = (22, 24, 29)          # --ink
INK_2 = (74, 79, 90)        # --ink-2
INK_3 = (138, 144, 153)     # --ink-3
RULE = (214, 211, 202)      # --rule
RULE_2 = (180, 176, 164)    # --rule-2
ACCENT = (11, 92, 138)      # --accent, drafting blue


def load(rel: str, size: int, weight: int | None = None) -> ImageFont.FreeTypeFont:
    """Load one of the site's woff2 faces at `size`.

    Pillow cannot read woff2, so the file is decompressed to an in-memory TTF
    first. `weight` selects an instance of a variable face; static faces ignore
    it. Any failure falls back to a system face, because a slightly wrong card
    is better than a build that cannot produce one at all.
    """
    src = FONTS / rel
    try:
        tt = TTFont(str(src), fontNumber=0)
        buf = io.BytesIO()
        tt.flavor = None          # drop woff2 compression, emit plain TTF
        tt.save(buf)
        buf.seek(0)
        font = ImageFont.truetype(buf, size)
        if weight is not None:
            try:
                font.set_variation_by_axes([weight])
            except OSError:
                pass              # not a variable face
        return font
    except Exception as exc:                                  # noqa: BLE001
        print(f"  ! {src.name}: {exc}; falling back to Arial")
        return ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", size)


SG = "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2"
PS = "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2"
PM4 = "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"
PM5 = "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2"


def tracked(draw, xy, text, font, fill, tracking=0.0):
    """Draw `text` with letter-spacing, which Pillow does not support."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def main() -> None:
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    f_name = load(SG, 92, weight=700)
    f_role = load(SG, 30, weight=500)
    f_body = load(PS, 23, weight=400)
    f_label = load(PM5, 15)
    f_cell = load(PM4, 20)

    # --- sheet frame: two rules, the outer one lighter ---------------------
    d.rectangle([M, M, W - M, H - M], outline=RULE, width=1)
    d.rectangle([M + 8, M + 8, W - M - 8, H - M - 8], outline=PAPER_3, width=1)

    x = M + GUT
    right = W - M - GUT

    # --- top label row -----------------------------------------------------
    y = M + GUT + 2
    tracked(d, (x, y), "PORTFOLIO", f_label, INK_3, tracking=2.4)
    w = d.textlength("www.omerdengiz.com", font=f_label)
    d.text((right - w, y), "www.omerdengiz.com", font=f_label, fill=INK_3)

    y += 30
    d.line([x, y, right, y], fill=RULE_2, width=1)

    # --- name --------------------------------------------------------------
    y += 54
    d.text((x, y), "Omer Dengiz", font=f_name, fill=INK)

    # --- role line, matching profile.ts ------------------------------------
    #
    # Measured and shrunk to fit rather than trusted to fit. The first version
    # of this card ran "IT Operations" past the right rule, which nobody sees
    # until the link is shared somewhere.
    parts = ("Systems Administration", "Cloud Infrastructure", "Networking",
             "IT Operations")
    gap = 12
    for size in range(30, 17, -1):
        f_role = load(SG, size, weight=500)
        dot = d.textlength("\u00b7", font=f_role)
        total = (sum(d.textlength(p, font=f_role) for p in parts)
                 + (len(parts) - 1) * (2 * gap + dot))
        if x + total <= right:
            break
    assert x + total <= right, "role line does not fit the sheet"

    y += 116
    rx = x
    for i, part in enumerate(parts):
        if i:
            d.text((rx + gap, y), "\u00b7", font=f_role, fill=INK_3)
            rx += gap + dot + gap
        d.text((rx, y), part, font=f_role, fill=ACCENT)
        rx += d.textlength(part, font=f_role)

    # --- one line of substance, no claim sentence --------------------------
    y += 58
    d.text(
        (x, y),
        "Terraform, AWS, Kubernetes, Linux, Cisco. Infrastructure built as code",
        font=f_body,
        fill=INK_2,
    )
    d.text((x, y + 32), "and rebuilt the same way.", font=f_body, fill=INK_2)

    # --- title-block cells -------------------------------------------------
    cy = H - M - GUT - 62
    d.line([x, cy, right, cy], fill=RULE_2, width=1)

    cells = [
        ("LOCATION", "Kanata, ON"),
        # The AWS certifications lapsed in Jul and Aug 2026. The card is the
        # most-shared view of the site, so it carries the credential that is
        # current rather than one that needs a date to be read correctly.
        ("SCREENING", "RCMP Level 2 (current)"),
        ("STATUS", "Open to roles in Canada"),
    ]
    col = (right - x) / len(cells)
    # Same treatment as the role line. A value that overruns its column lands
    # on top of the next cell's value, which is what the first card did.
    for size in range(20, 12, -1):
        f_cell = load(PM4, size)
        if max(d.textlength(v, font=f_cell) for _, v in cells) <= col - 26:
            break
    for i, (label, value) in enumerate(cells):
        cx = x + i * col
        assert d.textlength(value, font=f_cell) <= col - 26, \
            f"cell {label!r} overruns its column"
        if i:
            d.line([cx - 18, cy + 1, cx - 18, H - M - GUT], fill=RULE, width=1)
        tracked(d, (cx, cy + 16), label, f_label, INK_3, tracking=1.6)
        d.text((cx, cy + 38), value, font=f_cell, fill=INK)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"  wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
