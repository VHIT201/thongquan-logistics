from PIL import Image
from collections import Counter
import sys

def get_dominant_colors(image_path, n=6):
    img = Image.open(image_path).convert("RGB")
    # Resize để xử lý nhanh hơn
    img = img.resize((200, 200))
    pixels = list(img.getdata())

    # Làm tròn màu để nhóm các sắc thái gần nhau
    def quantize(c, step=24):
        return tuple((v // step) * step for v in c)

    quantized = [quantize(p) for p in pixels]
    # Bỏ qua màu trắng và đen quá gần
    filtered = [c for c in quantized if not all(v > 240 for v in c) and not all(v < 20 for v in c)]
    if not filtered:
        filtered = quantized

    counter = Counter(filtered)
    most_common = counter.most_common(n)

    colors = []
    for (r, g, b), count in most_common:
        hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
        colors.append({"hex": hex_color, "rgb": (r, g, b), "count": count})
    return colors

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "public/logo.png"
    print(f"Phân tích màu từ: {path}\n")
    colors = get_dominant_colors(path, n=6)
    for i, c in enumerate(colors, 1):
        r, g, b = c["rgb"]
        print(f"{i}. {c['hex']}  (RGB: {r},{g},{b})  – xuất hiện ~{c['count']} lần")
