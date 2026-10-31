// Optional asset maintenance only; the published site needs no Node dependencies.
const path = require("node:path");
const sharp = require(process.env.SHARP_MODULE || "sharp");

const directory = path.resolve(__dirname, "../images/evolved");
const previews = [
  ["taixu-feature", [360, 720, 1440]],
  ["amped-feature-desktop", [300, 600, 1200]],
  ["amped-feature-pda", [90, 180, 360]]
];

(async () => {
  for (const [name, widths] of previews) {
    for (const width of widths) {
      const destination = path.join(directory, `${name}-${width}.webp`);
      await sharp(path.join(directory, `${name}.png`))
        .resize({ width, kernel: "lanczos3", withoutEnlargement: true })
        .webp({ lossless: true, effort: 6 })
        .toFile(destination);
      console.log(path.basename(destination));
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
