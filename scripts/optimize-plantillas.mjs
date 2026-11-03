// Segunda pasada solo para plantillas: 1400px max + paleta, calidad primero
import sharp from 'sharp'
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const LIMIT = 200 * 1024
const files = [
  'public/assets/images/balines/plantillapremiumlisos.png',
  'public/assets/images/balines/plantillapremiumdiamantados.png',
]

for (const f of files) {
  const before = statSync(f).size
  const buf = readFileSync(f)
  const meta = await sharp(buf).metadata()
  let out = await sharp(buf).resize({ width: Math.min(meta.width || 1400, 1400), withoutEnlargement: true })
    .png({ palette: true, compressionLevel: 9, effort: 10, quality: 82 }).toBuffer()
  if (out.length > LIMIT) {
    out = await sharp(buf).resize({ width: 1000, withoutEnlargement: true })
      .png({ palette: true, compressionLevel: 9, effort: 10, quality: 70 }).toBuffer()
  }
  if (out.length < before) {
    writeFileSync(f, out)
    console.log(`${f}: ${(before / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB (${meta.width}x${meta.height})`)
  } else {
    console.log(`${f}: sin ahorro extra, se mantiene en ${(before / 1024).toFixed(0)}KB`)
  }
}
