// Script para optimizar imágenes en public/assets/images/
// Ejecutar: node scripts/optimize-images.js
// Requiere: npm install sharp

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../public/assets/images');
const MAX_WIDTH = 1200;
const QUALITY = 80;

async function optimizeImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await optimizeImages(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const outputName = path.basename(entry.name, ext) + '.webp';
    const outputPath = path.join(dir, outputName);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭  ${outputName} ya existe`);
      continue;
    }

    try {
      const image = sharp(fullPath);
      const metadata = await image.metadata();

      let pipeline = image;

      if (metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }

      await pipeline
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const originalSize = fs.statSync(fullPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${entry.name} → ${outputName} (${savings}% ahorro)`);
    } catch (err) {
      console.error(`❌ ${entry.name}: ${err.message}`);
    }
  }
}

optimizeImages(IMAGES_DIR).then(() => {
  console.log('\n✨ Optimización completada');
});
