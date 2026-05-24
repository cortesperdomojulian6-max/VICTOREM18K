const MATERIAL_LABELS = {
  '#d4af37': 'oro laminado 18K',
  '#c0c0c0': 'plata laminada',
  '#e8a0b4': 'oro rosado laminado 18K',
  '#1a1a1a': 'balinería ennegrecida',
}

const DIJON_NAMES = {
  'infinito': 'infinito',
  'corazon': 'corazón sólido',
  'cruz': 'cruz clásica',
  'corona-grande': 'corona grande',
  'corona-pequena-oval': 'corona ovalada',
  'trebol': 'trébol de cuatro hojas',
  'herradura-caballo': 'herradura con caballo',
  'billete-dollar': 'billete dólar',
  'fe-grande': 'Fe grande',
  'fe-conector-pequeno': 'Fe (conector)',
  'arcangel-san-miguel-dorado': 'San Miguel Arcángel',
  'arcangel-rose-gold': 'San Miguel Arcángel en rose gold',
  'san-benito-grande': 'San Benito',
  'san-jose': 'San José',
  'virgen-guadalupe': 'Virgen de Guadalupe',
  'virgen-medalla': 'Virgen Medalla',
}

const TYPE_LABELS = {
  pulsera: 'Pulsera',
  anillo: 'Anillo',
}

function describeCustomOrder(config) {
  if (!config || !config.sequence) return 'Pieza personalizada artesanal.'

  const type = config.type || 'pulsera'
  const typeLabel = TYPE_LABELS[type] || 'Pieza'
  const color = config.color || '#d4af37'
  const material = MATERIAL_LABELS[color] || 'oro laminado 18K'
  const sequence = config.sequence || []
  const dije = config.dije || null
  const defaultType = config.defaultBalinType || 'liso'

  const balinCount = sequence.filter(s => s.kind === 'balin').length
  const neoprenoCount = sequence.filter(s => s.kind === 'neopreno').length
  const lisoCount = sequence.filter(s => s.kind === 'balin' && s.type === 'liso').length
  const diamCount = sequence.filter(s => s.kind === 'balin' && s.type === 'diamantado').length

  let desc = ''

  if (balinCount > 0) {
    desc += `${typeLabel} artesanal tejida en ${material}`

    if (lisoCount > 0 && diamCount > 0) {
      desc += ` con una combinación de ${lisoCount} balines lisos y ${diamCount} diamantados`
    } else if (lisoCount > 0) {
      desc += ` con ${balinCount} balines lisos`
    } else {
      desc += ` con ${balinCount} balines diamantados`
    }
  } else {
    desc += `${typeLabel} artesanal en ${material}`
  }

  if (dije) {
    const dijonName = DIJON_NAMES[dije] || dije
    desc += `, adornada con un dije de ${dijonName}`
  }

  if (neoprenoCount > 0) {
    desc += ` y segmentos de neopreno en tono coordinado`
  }

  desc += `. Cada esfera ha sido seleccionada y enhebrada a mano en Campoalegre, Huila, creando una pieza única que combina la tradición artesanal con el diseño contemporáneo.`

  return desc
}

module.exports = { describeCustomOrder }
