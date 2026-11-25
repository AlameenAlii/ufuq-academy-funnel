"""Generate ufuq favicon + apple-touch-icon from the new wordmark.

Proper favicon treatment: at 16-32px the full "ufuq" wordmark is unreadable,
so the icon uses the single "n" arch (first letter of the mark) in white on
the brand ink (#131A33), with rounded corners. The 180px apple-touch-icon
uses a solid background (Apple ignores transparency).
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

INK = (19, 26, 51, 255)  # #131A33 — matches --primary-deep / ufuq-dark.svg
WHITE = (255, 255, 255, 255)


def draw_n(draw: ImageDraw.ImageDraw, size: int) -> None:
    """Draw the rounded "n" (arch + two stems) centred in a `size` canvas."""
    stroke = max(2, round(size * 0.115))
    # Letter bounding box (square-ish, centred with padding for the stroke).
    pad = round(size * 0.24)
    x0, x1 = pad, size - pad
    top, bottom = pad, size - pad
    mid_y = top + (x1 - x0) / 2  # arch springs from here

    # Stems.
    draw.line([(x0, bottom), (x0, mid_y)], fill=WHITE, width=stroke, joint="curve")
    draw.line([(x1, bottom), (x1, mid_y)], fill=WHITE, width=stroke, joint="curve")
    # Arch (top half of the bounding ellipse).
    draw.arc([x0, top, x1, top + (x1 - x0)], start=180, end=0, fill=WHITE, width=stroke)


def rounded_background(size: int, radius_ratio: float = 0.24) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        [0, 0, size - 1, size - 1],
        radius=round(size * radius_ratio),
        fill=INK,
    )
    return img


def make_icon(size: int, solid: bool = False) -> Image.Image:
    img = rounded_background(size)
    if solid:
        # Apple touch icon: flatten onto solid ink (no transparency).
        bg = Image.new("RGBA", (size, size), INK)
        bg.alpha_composite(img)
        img = bg
    draw = ImageDraw.Draw(img)
    draw_n(draw, size)
    return img


def main() -> None:
    fav32 = make_icon(32)
    fav32.save(PUBLIC / "favicon-32.png")

    touch = make_icon(180, solid=True).convert("RGB")
    touch.save(PUBLIC / "apple-touch-icon.png")

    # Multi-size ICO for legacy browsers / tabs.
    icon48 = make_icon(48)
    icon32 = make_icon(32)
    icon16 = make_icon(16)
    icon48.save(
        PUBLIC / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[icon32, icon16],
    )
    print("wrote favicon-32.png, apple-touch-icon.png, favicon.ico")


if __name__ == "__main__":
    main()
