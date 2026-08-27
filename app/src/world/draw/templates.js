// Coloring-page outlines. Each template is a list of SVG path `d` strings in a
// 400x400 box, drawn as thick black strokes with no fill so she colors inside.
// Pure data (no DOM) so the catalog can be validated by unit tests.

export const TEMPLATE_VIEW = 400
export const TEMPLATE_STROKE = 8

const rad = (deg) => (deg * Math.PI) / 180
const f = (n) => Math.round(n * 10) / 10

/** ellipse as two arcs; `rot` in degrees */
export function ellipsePath(cx, cy, rx, ry, rot = 0) {
  const c = Math.cos(rad(rot))
  const s = Math.sin(rad(rot))
  const x1 = f(cx + rx * c)
  const y1 = f(cy + rx * s)
  const x2 = f(cx - rx * c)
  const y2 = f(cy - rx * s)
  return `M${x1} ${y1} A${rx} ${ry} ${rot} 1 0 ${x2} ${y2} A${rx} ${ry} ${rot} 1 0 ${x1} ${y1} Z`
}
export const circlePath = (cx, cy, r) => ellipsePath(cx, cy, r, r)

/** puffy cloud with a flat base, centred on (cx, cy), scaled by `s` */
export function cloudPath(cx, cy, s = 1) {
  const p = (x, y) => `${f(cx + x * s)} ${f(cy + y * s)}`
  const r = (n) => f(n * s)
  return [
    `M${p(-62, 22)} L${p(62, 22)}`,
    `A${r(24)} ${r(24)} 0 0 0 ${p(58, -14)}`,
    `A${r(32)} ${r(32)} 0 0 0 ${p(8, -40)}`,
    `A${r(34)} ${r(34)} 0 0 0 ${p(-46, -22)}`,
    `A${r(28)} ${r(28)} 0 0 0 ${p(-62, 22)} Z`,
  ].join(' ')
}

const mirrorX = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f(TEMPLATE_VIEW - Number(x))} ${y}`)

// --- individual pages -------------------------------------------------------

const heart = [
  'M200 345 C130 290 40 230 40 145 C40 95 80 58 125 58 C162 58 188 80 200 108 C212 80 238 58 275 58 C320 58 360 95 360 145 C360 230 270 290 200 345 Z',
]

const flower = (() => {
  const cx = 200
  const cy = 165
  const petals = [0, 60, 120, 180, 240, 300].map((a) =>
    ellipsePath(cx + 80 * Math.cos(rad(a)), cy + 80 * Math.sin(rad(a)), 46, 28, a),
  )
  return [
    ...petals,
    circlePath(cx, cy, 36),
    'M200 291 L200 385',
    'M200 335 C240 300 285 310 295 340 C265 358 225 352 200 335 Z',
  ]
})()

const butterfly = (() => {
  const upperL = 'M188 175 C150 100 60 70 45 130 C35 175 90 215 188 205 Z'
  const lowerL = 'M188 215 C120 215 55 250 70 305 C85 345 160 330 188 265 Z'
  return [
    upperL,
    mirrorX(upperL),
    lowerL,
    mirrorX(lowerL),
    ellipsePath(200, 212, 13, 78),
    circlePath(200, 122, 16),
    'M192 108 C175 80 160 70 150 62',
    'M208 108 C225 80 240 70 250 62',
    circlePath(150, 62, 5),
    circlePath(250, 62, 5),
    circlePath(110, 150, 18),
    circlePath(290, 150, 18),
    circlePath(125, 280, 12),
    circlePath(275, 280, 12),
  ]
})()

const unicorn = [
  ellipsePath(200, 235, 92, 100),
  'M200 45 L172 140 L228 140 Z',
  'M183 105 L217 105',
  'M178 122 L222 122',
  'M140 150 L128 95 L178 135',
  'M260 150 L272 95 L222 135',
  circlePath(168, 225, 11),
  circlePath(232, 225, 11),
  circlePath(184, 300, 5),
  circlePath(216, 300, 5),
  'M172 315 Q200 338 228 315',
  'M125 165 C70 175 50 250 90 320',
  'M112 205 C80 230 85 290 115 330',
]

const dress = [
  'M168 45 Q200 62 232 45 L248 165 L330 355 L70 355 L152 165 Z',
  'M168 45 C140 60 128 85 135 110 L158 100',
  'M232 45 C260 60 272 85 265 110 L242 100',
  'M152 165 Q200 185 248 165',
  'M175 185 L128 355',
  'M225 185 L272 355',
  circlePath(200, 176, 10),
]

const rainbow = [
  ...[170, 138, 106, 74, 42].map((r) => `M${200 - r} 300 A${r} ${r} 0 0 1 ${200 + r} 300`),
  cloudPath(72, 300, 1),
  cloudPath(328, 300, 1),
]

const car = [
  'M55 255 L55 195 L105 185 L145 125 L265 125 L315 185 L345 195 L345 255 Z',
  'M155 137 L200 137 L200 183 L125 183 Z',
  'M215 137 L258 137 L293 183 L215 183 Z',
  'M207 183 L207 255',
  circlePath(120, 258, 34),
  circlePath(280, 258, 34),
  circlePath(120, 258, 13),
  circlePath(280, 258, 13),
  circlePath(335, 222, 9),
  'M20 305 L380 305',
]

const cupcake = [
  'M110 225 L132 355 L268 355 L290 225 Z',
  'M150 232 L160 350',
  'M200 232 L200 350',
  'M250 232 L240 350',
  'M108 225 C68 225 78 178 122 182 C108 140 172 132 186 162 C202 118 264 124 258 160 C296 140 326 178 294 192 C334 198 322 232 292 225 Z',
  circlePath(206, 104, 16),
  'M208 88 C214 72 226 64 240 60',
]

export const BLANK_TEMPLATE = { id: 'blank', name: 'דף ריק', emoji: '⬜', paths: [] }

export const TEMPLATES = [
  BLANK_TEMPLATE,
  { id: 'heart', name: 'לב', emoji: '❤️', paths: heart },
  { id: 'flower', name: 'פרח', emoji: '🌸', paths: flower },
  { id: 'butterfly', name: 'פרפר', emoji: '🦋', paths: butterfly },
  { id: 'unicorn', name: 'חד-קרן', emoji: '🦄', paths: unicorn },
  { id: 'dress', name: 'שמלת נסיכה', emoji: '👗', paths: dress },
  { id: 'rainbow', name: 'קשת בענן', emoji: '🌈', paths: rainbow },
  { id: 'car', name: 'מכונית', emoji: '🚗', paths: car },
  { id: 'cupcake', name: 'קאפקייק', emoji: '🧁', paths: cupcake },
]

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) ?? BLANK_TEMPLATE
