import { describe, it, expect } from 'vitest'
import {
  toGray,
  boxBlurGray,
  flatField,
  paperLevel,
  autoTrimBounds,
  keyToAlpha,
  processPage,
  PAPER_CUT,
} from '../world/draw/pageInk.js'
import { pageMetaFromPath, pagesFromGlob, loadPageModes, savePageMode, MODE_OPACITY } from '../world/draw/familyPages.js'

/** ImageData-shaped buffer from a (x,y) -> [r,g,b] function */
function make(width, height, fn) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fn(x, y)
      const i = (y * width + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return { data, width, height }
}

/**
 * Stand-in for the reference photo: a printed coloring page shot on a table —
 * cream paper, a lighting gradient across it, black pen strokes, and the dark
 * table visible along the top and left edges.
 */
function photographedPage(w = 220, h = 300) {
  const bandTop = Math.round(h * 0.06)
  const bandLeft = Math.round(w * 0.05)
  return make(w, h, (x, y) => {
    if (y < bandTop || x < bandLeft) return [92, 68, 48] // wooden table
    // cream paper, brighter top-left, dimmer bottom-right
    const shade = 1 - 0.22 * ((x / w) * 0.5 + (y / h) * 0.5)
    const paper = [242 * shade, 237 * shade, 228 * shade]
    // strokes: a border box and a diagonal, 2px wide
    const inBox =
      (Math.abs(x - w * 0.25) < 1.5 || Math.abs(x - w * 0.75) < 1.5) && y > h * 0.25 && y < h * 0.75
    const inRule = Math.abs((y - h * 0.25) - (x - w * 0.25)) < 1.5 && x > w * 0.25 && x < w * 0.75
    return inBox || inRule ? [28, 26, 24] : paper
  })
}

describe('boxBlurGray', () => {
  it('leaves a flat field flat', () => {
    const g = new Uint8ClampedArray(40 * 40).fill(180)
    const out = boxBlurGray(g, 40, 40, 4)
    expect([...out].every((v) => Math.abs(v - 180) <= 1)).toBe(true)
  })

  it('spreads an impulse and conserves brightness order', () => {
    const g = new Uint8ClampedArray(21 * 21)
    g[10 * 21 + 10] = 255
    const out = boxBlurGray(g, 21, 21, 3)
    expect(out[10 * 21 + 10]).toBeGreaterThan(0)
    expect(out[10 * 21 + 10]).toBeLessThan(255)
    // compare against a pixel outside the kernel (radius 3), not inside it
    expect(out[10 * 21 + 10]).toBeGreaterThan(out[10 * 21 + 18])
  })

  it('radius 0 is a copy', () => {
    const g = Uint8ClampedArray.from({ length: 25 }, (_, i) => i * 10)
    expect([...boxBlurGray(g, 5, 5, 0)]).toEqual([...g])
  })
})

describe('flatField', () => {
  it('flattens a lighting gradient on blank paper', () => {
    const w = 120
    const h = 120
    const img = make(w, h, (x) => {
      const v = 240 - (x / w) * 60 // bright left, dim right
      return [v, v - 4, v - 10]
    })
    const flat = flatField(toGray(img), w, h)
    const mid = []
    for (let x = 10; x < w - 10; x++) mid.push(flat[60 * w + x])
    const min = Math.min(...mid)
    const max = Math.max(...mid)
    expect(max - min).toBeLessThan(0.03) // uniform after correction
    expect(min).toBeGreaterThan(PAPER_CUT) // and reads as paper
  })

  it('keeps thin dark strokes dark', () => {
    const w = 120
    const h = 120
    const img = make(w, h, (x) => (Math.abs(x - 60) < 1.5 ? [20, 20, 20] : [235, 232, 224]))
    const flat = flatField(toGray(img), w, h)
    expect(flat[60 * w + 60]).toBeLessThan(0.3)
    expect(flat[60 * w + 20]).toBeGreaterThan(PAPER_CUT)
  })
})

describe('paperLevel', () => {
  it('finds the bright mode of cream paper', () => {
    const img = photographedPage()
    const level = paperLevel(toGray(img))
    expect(level).toBeGreaterThan(150)
    expect(level).toBeLessThan(256)
  })
})

describe('autoTrimBounds', () => {
  it('crops the table band off a photographed page', () => {
    const img = photographedPage()
    const b = autoTrimBounds(toGray(img), img.width, img.height)
    expect(b.top).toBeGreaterThan(0)
    expect(b.left).toBeGreaterThan(0)
    expect(b.width).toBeLessThan(img.width)
  })

  it('never trims more than the cap, even on an all-dark image', () => {
    const w = 100
    const h = 100
    const dark = make(w, h, () => [20, 20, 20])
    const b = autoTrimBounds(toGray(dark), w, h)
    expect(b.top).toBeLessThanOrEqual(Math.floor(h * 0.15))
    expect(b.left).toBeLessThanOrEqual(Math.floor(w * 0.15))
    expect(b.width).toBeGreaterThan(w * 0.7)
  })

  it('leaves a clean page untouched', () => {
    const w = 80
    const h = 80
    const clean = make(w, h, () => [252, 252, 250])
    const b = autoTrimBounds(toGray(clean), w, h)
    expect(b).toMatchObject({ left: 0, top: 0, width: w, height: h })
  })
})

describe('keyToAlpha', () => {
  it('paper becomes transparent, ink becomes opaque black', () => {
    const w = 4
    const h = 1
    const flat = new Float32Array([1, 0.95, 0.5, 0.2])
    const { data } = keyToAlpha(flat, w, h)
    expect(data[3]).toBe(0) // pure white -> transparent
    expect(data[7]).toBe(0) // above paperCut -> transparent
    expect(data[11]).toBe(255) // below inkCut -> solid
    expect(data[15]).toBe(255)
    expect([data[8], data[9], data[10]]).toEqual([0, 0, 0]) // colour forced black
  })

  it('ramps mid-tones instead of clipping them', () => {
    const flat = new Float32Array([(0.86 + 0.62) / 2])
    const { data } = keyToAlpha(flat, 1, 1)
    expect(data[3]).toBeGreaterThan(100)
    expect(data[3]).toBeLessThan(160)
  })
})

describe('processPage on a photographed page', () => {
  const img = photographedPage()
  const out = processPage(img)

  it('trims the table and returns a smaller page', () => {
    expect(out.width).toBeLessThan(img.width)
    expect(out.height).toBeLessThan(img.height)
    expect(out.bounds.top).toBeGreaterThan(0)
  })

  it('makes the cream paper fully transparent', () => {
    // sample well inside the page, away from the strokes
    const at = (x, y) => out.data[(y * out.width + x) * 4 + 3]
    expect(at(Math.round(out.width * 0.5), Math.round(out.height * 0.1))).toBe(0)
    expect(at(Math.round(out.width * 0.9), Math.round(out.height * 0.9))).toBe(0)
  })

  it('keeps the strokes as opaque black ink', () => {
    let inked = 0
    for (let i = 3; i < out.data.length; i += 4) if (out.data[i] > 200) inked++
    expect(inked).toBeGreaterThan(100) // the strokes survived
    const ratio = inked / (out.width * out.height)
    expect(ratio).toBeLessThan(0.2) // but the page did not go black
  })

  it('every opaque pixel is black, not tinted', () => {
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3] > 0) {
        expect(out.data[i]).toBe(0)
        expect(out.data[i + 1]).toBe(0)
        expect(out.data[i + 2]).toBe(0)
      }
    }
  })
})

describe('family page discovery', () => {
  it('derives a Hebrew-friendly name and slug id from the filename', () => {
    expect(pageMetaFromPath('./family/סבתא.png')).toMatchObject({ name: 'סבתא', vector: false })
    expect(pageMetaFromPath('./family/the_dog.svg')).toMatchObject({ name: 'the dog', vector: true })
    expect(pageMetaFromPath('./family/Tommy-2026.JPG').id).toBe('family-tommy-2026')
  })

  it('maps and sorts a glob result', () => {
    const pages = pagesFromGlob({ './family/ב.png': '/b.png', './family/א.png': '/a.png' })
    expect(pages.map((p) => p.name)).toEqual(['א', 'ב'])
    expect(pages[0]).toMatchObject({ url: '/a.png', kind: 'image' })
  })

  it('handles an empty folder', () => {
    expect(pagesFromGlob({})).toEqual([])
    expect(pagesFromGlob(undefined)).toEqual([])
  })
})

describe('page display modes', () => {
  const mem = () => {
    const store = new Map()
    return { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }
  }

  it('remembers a per-page choice', () => {
    const s = mem()
    const next = savePageMode({}, 'family-סבתא', 'trace', s)
    expect(next['family-סבתא']).toBe('trace')
    expect(loadPageModes(s)).toEqual(next)
  })

  it('survives unusable storage', () => {
    const broken = { getItem: () => { throw new Error('nope') }, setItem: () => { throw new Error('nope') } }
    expect(loadPageModes(broken)).toEqual({})
    expect(savePageMode({}, 'x', 'lines', broken)).toEqual({ x: 'lines' })
  })

  it('trace is faint, lines are solid', () => {
    expect(MODE_OPACITY.lines).toBe(1)
    expect(MODE_OPACITY.trace).toBeLessThan(0.4)
  })
})
