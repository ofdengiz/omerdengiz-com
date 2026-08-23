"""
Generate the og:image (1200x630 PNG) that shows up when omerdengiz.com
is pasted into LinkedIn / Twitter / Slack / Discord.

Aesthetic matches the live site:
  - dark navy background (#0b1020) with a radial violet/cyan gradient
  - faint orbital rings echoing the hero canvas
  - skill-forward copy, no claim sentences

Output: site/assets/og.png
Run:    python site/_tools/generate_og.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
OUT = Path(__file__).resolve().parents[1] / "site" / "assets" / "og.png"

# --- palette -----------------------------------------------------------------
BG_TOP     = (11, 16, 32)      # #0b1020
BG_BOTTOM  = (18, 22, 48)      # slightly lighter
CYAN       = (76, 201, 240)    # #4cc9f0
VIOLET     = (123, 44, 191)    # #7b2cbf
PINK       = (247, 37, 133)    # #f72585
TEXT_MAIN  = (231, 236, 255)   # #e7ecff
TEXT_MUTED = (168, 178, 214)   # #a8b2d6
ACCENT     = (255, 153, 0)     # AWS orange

# --- helpers -----------------------------------------------------------------

def linear_gradient(size, top, bottom):
    img = Image.new("RGB", size, top)
    px = img.load()
    w, h = size
    for y in range(h):
        t = y / (h - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def radial_glow(size, center, radius, color, alpha_peak=120):
    """Soft radial gradient blob stamped into an RGBA layer."""
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    # Draw on a smaller canvas then upscale+blur for smooth falloff.
    small_w, small_h = w // 4, h // 4
    small = Image.new("RGBA", (small_w, small_h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(small)
    cx, cy = center[0] // 4, center[1] // 4
    r = radius // 4
    steps = 18
    for i in range(steps, 0, -1):
        rr = int(r * (i / steps))
        a = int(alpha_peak * ((steps - i + 1) / steps) ** 2)
        sd.ellipse(
            (cx - rr, cy - rr, cx + rr, cy + rr),
            fill=(color[0], color[1], color[2], a),
        )
    small = small.filter(ImageFilter.GaussianBlur(radius=4))
    return layer.alpha_composite(
        small.resize((w, h), Image.LANCZOS)
    ) or layer.__ior__ or layer  # noqa: not used; see next line
    # NB: alpha_composite mutates in place and returns None. Actual return is below.


def composite_glow(base, center, radius, color, alpha_peak=120):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    small_w, small_h = base.size[0] // 4, base.size[1] // 4
    small = Image.new("RGBA", (small_w, small_h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(small)
    cx, cy = center[0] // 4, center[1] // 4
    r = radius // 4
    steps = 18
    for i in range(steps, 0, -1):
        rr = int(r * (i / steps))
        a = int(alpha_peak * ((steps - i + 1) / steps) ** 2)
        sd.ellipse(
            (cx - rr, cy - rr, cx + rr, cy + rr),
            fill=(color[0], color[1], color[2], a),
        )
    small = small.filter(ImageFilter.GaussianBlur(radius=4))
    layer = small.resize(base.size, Image.LANCZOS)
    return Image.alpha_composite(base.convert("RGBA"), layer)


def pick_font(candidates, size):
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def main():
    # 1) Dark background with gradient
    img = linear_gradient((W, H), BG_TOP, BG_BOTTOM).convert("RGBA")

    # 2) Ambient glows (violet top-left, cyan bottom-right, pink mid-right)
    img = composite_glow(img, (180, 120),  520, VIOLET, alpha_peak=140)
    img = composite_glow(img, (1080, 520), 480, CYAN,   alpha_peak=110)
    img = composite_glow(img, (1040, 200), 260, PINK,   alpha_peak=70)

    # 3) Orbital rings — faint concentric circles, right-side echo of hero
    draw = ImageDraw.Draw(img, "RGBA")
    ring_cx, ring_cy = 1050, H // 2
    for r, a in [(320, 34), (260, 42), (200, 50), (140, 58), (80, 80)]:
        draw.ellipse(
            (ring_cx - r, ring_cy - r, ring_cx + r, ring_cy + r),
            outline=(CYAN[0], CYAN[1], CYAN[2], a),
            width=2,
        )
    # Two orbit dots
    draw.ellipse((ring_cx + 316, ring_cy - 8,  ring_cx + 332, ring_cy + 8),
                 fill=(CYAN[0], CYAN[1], CYAN[2], 240))
    draw.ellipse((ring_cx - 204, ring_cy - 6,  ring_cx - 192, ring_cy + 6),
                 fill=(PINK[0], PINK[1], PINK[2], 230))
    draw.ellipse((ring_cx + 138, ring_cy - 5,  ring_cx + 148, ring_cy + 5),
                 fill=(VIOLET[0], VIOLET[1], VIOLET[2], 230))

    # 4) Fonts
    inter_bold = [
        r"C:\Windows\Fonts\segoeuib.ttf",     # Segoe UI Bold
        r"C:\Windows\Fonts\arialbd.ttf",
    ]
    inter_regular = [
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    mono = [
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\consolab.ttf",
    ]

    f_name     = pick_font(inter_bold,    104)
    f_skills   = pick_font(inter_bold,     40)
    f_tools    = pick_font(inter_regular,  28)
    f_tag      = pick_font(mono,           22)
    f_brand    = pick_font(mono,           22)

    # 5) Copy (skill-forward, no claim sentences)
    left_x = 80
    # Eyebrow (cert · location)
    draw.text((left_x, 96), "omerdengiz.com", font=f_brand, fill=TEXT_MUTED)

    # Name
    draw.text((left_x, 150), "Omer Dengiz", font=f_name, fill=TEXT_MAIN)

    # Role line — category-level skills, not a single title
    draw.text(
        (left_x, 288),
        "Cloud  ·  DevOps  ·  Systems  ·  Networking",
        font=f_skills,
        fill=(CYAN[0], CYAN[1], CYAN[2], 255),
    )

    # Tooling line
    draw.text(
        (left_x, 362),
        "AWS  ·  Terraform  ·  Kubernetes  ·  Jenkins  ·  Ansible",
        font=f_tools,
        fill=TEXT_MAIN,
    )
    draw.text(
        (left_x, 402),
        "Linux  ·  Cisco  ·  Python  ·  Bash  ·  PowerShell",
        font=f_tools,
        fill=TEXT_MAIN,
    )

    # Bottom stripe: certs + location
    stripe_y = 500
    draw.rectangle((left_x, stripe_y, left_x + 4, stripe_y + 80),
                   fill=(ACCENT[0], ACCENT[1], ACCENT[2], 255))
    draw.text(
        (left_x + 22, stripe_y + 4),
        "AWS Certified Solutions Architect — Associate",
        font=f_skills,
        fill=TEXT_MAIN,
    )
    draw.text(
        (left_x + 22, stripe_y + 50),
        "Kanata, ON  ·  open to full-time roles in Canada",
        font=f_tag,
        fill=TEXT_MUTED,
    )

    # Save
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
