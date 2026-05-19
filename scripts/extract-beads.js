const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

async function extractBeads(inputPath, outputDir, prefix) {
  const basename = path.basename(inputPath)
  console.log(`\nProcesando: ${basename}`)

  const { data, info } = await sharp(inputPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  const pixels = new Uint8Array(data)

  const columnBrightness = new Array(width).fill(0)
  for (let x = 0; x < width; x++) {
    let sum = 0
    for (let y = 0; y < height; y++) {
      sum += pixels[y * width + x]
    }
    columnBrightness[x] = sum / height
  }

  const threshold = Math.max(...columnBrightness) * 0.4
  const minDist = width * 0.07

  const peaks = []
  for (let x = 1; x < width - 1; x++) {
    if (
      columnBrightness[x] > threshold &&
      columnBrightness[x] > columnBrightness[x - 1] &&
      columnBrightness[x] > columnBrightness[x + 1]
    ) {
      const tooClose = peaks.some((p) => Math.abs(p.x - x) < minDist)
      if (!tooClose) {
        let beadWidth = 1
        while (x - beadWidth >= 0 && columnBrightness[x - beadWidth] > threshold) beadWidth++
        let beadRight = 1
        while (x + beadRight < width && columnBrightness[x + beadRight] > threshold) beadRight++
        const beadDiameter = beadWidth + beadRight

        peaks.push({
          x,
          brightness: columnBrightness[x],
          diameter: Math.min(beadDiameter, height * 0.9),
        })
      }
    }
  }

  console.log(`  Detectados ${peaks.length} balines en ${basename}`)

  const outputPath = path.join(outputDir, prefix)
  fs.mkdirSync(outputPath, { recursive: true })

  const results = []

  for (let i = 0; i < peaks.length; i++) {
    const p = peaks[i]
    const size = Math.round(p.diameter * 1.1)
    const cx = Math.round(p.x)
    const cy = Math.round(height / 2)

    let left = Math.round(cx - size / 2)
    let top = Math.round(cy - size / 2)
    let cropSize = size

    if (left < 0) { cropSize += left; left = 0 }
    if (top < 0) { cropSize += top; top = 0 }
    if (left + cropSize > width) cropSize = width - left
    if (top + cropSize > height) cropSize = height - top

    const filename = `${prefix}-${i + 1}.png`
    const filepath = path.join(outputPath, filename)

    await sharp(inputPath)
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(filepath)

    console.log(`  → ${filename} (${cropSize}x${cropSize})`)
    results.push({ filename, x: p.x, diameter: p.diameter })
  }

  return results
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'balines', 'individual')
  fs.mkdirSync(outputDir, { recursive: true })

  const lisosPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'balines', 'balineslisos.jpeg')
  const diamPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'balines', 'balinesdiamantados.jpeg')

  const lisos = await extractBeads(lisosPath, outputDir, 'liso')
  const diam = await extractBeads(diamPath, outputDir, 'diamantado')

  console.log('\n=== RESUMEN ===')
  console.log(`Lisos: ${lisos.length} balines`)
  console.log(`Diamantados: ${diam.length} balines`)
  console.log(`Total: ${lisos.length + diam.length} balines extraídos`)
  console.log(`Ubicación: ${outputDir}`)
}

main().catch(console.error)
