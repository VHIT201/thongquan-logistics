import sharp from "sharp";

async function extractColors(imagePath, n = 6) {
  const { data, info } = await sharp(imagePath)
    .resize(200, 200, { fit: "inside" })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue; // bỏ pixel trong suốt
    // Bỏ màu rất sáng (gần trắng) và rất tối (gần đen)
    if (r > 240 && g > 240 && b > 240) continue;
    if (r < 15 && g < 15 && b < 15) continue;
    pixels.push([r, g, b]);
  }

  // Quantize để nhóm màu gần nhau
  const step = 24;
  const map = new Map();
  for (const [r, g, b] of pixels) {
    const key = `${Math.floor(r / step) * step},${Math.floor(g / step) * step},${Math.floor(b / step) * step}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, n);

  return top.map(([key, count]) => {
    const [r, g, b] = key.split(",").map(Number);
    // Tính trung bình màu thực tế trong nhóm (đơn giản: dùng trung tâm bucket)
    const hex = `#${((1 << 24) + (r + step / 2) * 65536 + (g + step / 2) * 256 + (b + step / 2)).toString(16).slice(1)}`;
    return { hex, rgb: [Math.round(r + step / 2), Math.round(g + step / 2), Math.round(b + step / 2)], count };
  });
}

const colors = await extractColors("public/logo.png", 6);
console.log("🎨 Palette từ logo:\n");
colors.forEach((c, i) => {
  console.log(`${i + 1}. ${c.hex}  (RGB: ${c.rgb.join(",")})  – tần suất: ${c.count}`);
});
