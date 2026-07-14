from PIL import Image, ImageDraw
import math

SIZE = 1024
bg = (0xFD, 0xFA, 0xF0)  # matches static/apple-touch-icon.svg's fill="#fdfaf0"

# Matches static/favicon.svg and apple-touch-icon.svg exactly: linear-gradient(#74d7ed -> #7effa0), left to right.
GRAD_START = (0x74, 0xD7, 0xED)
GRAD_END = (0x7E, 0xFF, 0xA0)

cx, cy = SIZE / 2, SIZE / 2
r = SIZE * 0.34
stroke_width = int(SIZE * 0.075)


def hexagon_points(cx, cy, r, rotation=-90):
    pts = []
    for i in range(6):
        angle = math.radians(rotation + i * 60)
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts


# Horizontal gradient layer (left = cyan, right = green), matching favicon.svg's linearGradient.
gradient = Image.new("RGB", (SIZE, SIZE))
grad_pixels = gradient.load()
for x in range(SIZE):
    t = x / (SIZE - 1)
    color = tuple(int(GRAD_START[i] + (GRAD_END[i] - GRAD_START[i]) * t) for i in range(3))
    for y in range(SIZE):
        grad_pixels[x, y] = color

# Mask: white hexagon outline on black, used to cut the gradient into the stroke shape.
mask = Image.new("L", (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
hexagon = hexagon_points(cx, cy, r)
mask_draw.polygon(hexagon, outline=255, width=stroke_width)

img = Image.new("RGB", (SIZE, SIZE), bg)
img.paste(gradient, (0, 0), mask)

img.save("Blueprint/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png", "PNG")
print("done")
