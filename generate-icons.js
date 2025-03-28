const fs = require("fs");
const { createCanvas } = require("canvas");

const sizes = [16, 48, 128];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#065fd4";
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${size * 0.5}px Arial`;
  ctx.fillText("YT", size / 2, size / 2);

  return canvas.toBuffer();
}

// Create icons directory if it doesn't exist
if (!fs.existsSync("icons")) {
  fs.mkdirSync("icons");
}

// Generate icons for each size
sizes.forEach((size) => {
  const buffer = generateIcon(size);
  fs.writeFileSync(`icons/icon${size}.png`, buffer);
  console.log(`Generated ${size}x${size} icon`);
});
