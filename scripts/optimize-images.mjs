// Optimizador de assets: recomprime in-place (>200KB) manteniendo la MISMA ruta
import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = 'public/assets'
const LIMIT = 200 * 1024
const files = []
const walk = (dir) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name)
    if (f.isDirectory()) walk(p)
    else files.push(p)
  }
}
walk(ROOT)

// Solo las rutas que ya identificamos como pesadas (>200KB)
const targets = files.filter(f => statSync(f).size > LIMIT)
console.log(`Objetivo: ${targets.length} archivos pesados`)

const extOf = (f) => extname(f).toLowerCase()
let savedBytes = 0
const report = []

for (const file of targets) {
  const before = statSync(file).size
  const buf = readFileSync(file)
  const ext = extOf(file)
  let out = null

  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      // Fotos de producto: recomprimir con mozjpeg. Si no basta, reducir a 900px
      out = await sharp(buf).rotate().resize({ width: 1100, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      if (out.length > LIMIT) {
        out = await sharp(buf).rotate().resize({ width: 900, withoutEnlargement: true })
          .jpeg({ quality: 72, mozjpeg: true }).toBuffer()
      }
    } else if (ext === '.png') {
      // PNG: paleta cuantizada, preservando transparencia (plantillas/balines/logo)
      out = await sharp(buf).png({ palette: true, compressionLevel: 9, effort: 10, quality: 90 }).toBuffer()
      if (out.length > LIMIT) {
        out = await sharp(buf).png({ palette: true, compressionLevel: 9, effort: 10, quality: 80 }).toBuffer()
      }
    } else if (ext === '.webp') {
      out = await sharp(buf).webp({ quality: 76 }).toBuffer()
    }
  } catch (e) {
    report.push([file, before, `ERROR: ${e.message}`])
    continue
  }

  if (out && out.length < before) {
    writeFileSync(file, out)
    const after = out.length
    savedBytes += (before - after)
    report.push([file, before, after])
  } else {
    report.push([file, before, 'sin ahorro, se mantiene'])
  }
}

for (const [file, b, a] of report) {
  const r = typeof a === 'number'
    ? `${(b / 1024).toFixed(0)}KB -> ${(a / 1024).toFixed(0)}KB`
    : a
  console.log(`${join(file).replace('public/assets', '')}: ${r}`)
}

console.log(`\nTotal ahorrado: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`)
