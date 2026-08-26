// Dresses — drawn over the torso/arms, under the head. Colors: main, accent,
// optional trim (gold by default).
import { palette, starPath } from './util.js'

const RAINBOW = ['#f87171', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#a78bfa']

const BODICE = 'M 76 158 Q 100 152 124 158 L 121 204 L 79 204 Z'
const A_LINE = 'M 76 158 Q 100 150 124 158 L 140 240 Q 100 250 60 240 Z'
// bell skirt, hem ~y 292 so the shoes still peek out
const GOWN_SKIRT = 'M 78 204 L 122 204 C 150 234 160 262 166 284 Q 100 300 34 284 C 40 262 50 234 78 204 Z'
const GOWN_HEM = 'M 34 284 Q 100 300 166 284'

const o = (dark) => ({ stroke: dark, strokeWidth: 2.5, strokeLinejoin: 'round' })

function Puffs({ color, dark, r = 13 }) {
  return (
    <g>
      <circle cx="75" cy="165" r={r} fill={color} {...o(dark)} />
      <circle cx="125" cy="165" r={r} fill={color} {...o(dark)} />
    </g>
  )
}

function Straps({ color }) {
  return <path d="M 84 168 L 90 142 M 116 168 L 110 142" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
}

function Sparkles({ color, spots }) {
  return (
    <g fill={color} opacity="0.95">
      {spots.map(([x, y, r]) => (
        <path key={`${x}-${y}`} d={starPath(x, y, r, r * 0.4, 4)} />
      ))}
    </g>
  )
}

const plain = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Puffs color={p.main} dark={p.dark} />
      <path d={A_LINE} fill={p.main} {...o(p.dark)} />
      <ellipse cx="100" cy="160" rx="10" ry="4" fill={p.accent} />
    </g>
  )
}

const gown = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Puffs color={p.main} dark={p.dark} />
      <path d={BODICE} fill={p.main} {...o(p.dark)} />
      <path d={GOWN_SKIRT} fill={p.main} {...o(p.dark)} />
      <rect x="76" y="199" width="48" height="10" rx="5" fill={p.accent} stroke={p.dark} strokeWidth="2" />
      <path d="M 100 204 C 92 240 84 262 78 284" stroke={p.accent} strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M 100 204 C 108 240 116 262 122 284" stroke={p.accent} strokeWidth="2.5" fill="none" opacity="0.7" />
    </g>
  )
}

const FLOWERS = [[88, 202], [114, 216], [100, 236], [124, 192], [74, 228], [130, 234]]
const sundress = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Straps color={p.main} />
      <path d="M 78 166 L 122 166 L 142 250 Q 100 262 58 250 Z" fill={p.main} {...o(p.dark)} />
      <rect x="78" y="180" width="44" height="6" rx="3" fill={p.accent} />
      {FLOWERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.5" fill={p.accent} />
          <circle cx={x} cy={y} r="1.8" fill={p.trim} />
        </g>
      ))}
    </g>
  )
}

const tutu = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Straps color={p.main} />
      <path d="M 76 162 Q 100 156 124 162 L 121 202 L 79 202 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 79 200 L 121 200 Q 162 208 160 248 Q 100 262 40 248 Q 38 208 79 200 Z" fill={p.accent} {...o(p.dark)} />
      <path
        d="M 79 200 L 121 200 Q 152 206 150 236 Q 140 246 130 236 Q 120 248 110 236 Q 100 248 90 236 Q 80 248 70 236 Q 60 246 50 236 Q 48 206 79 200 Z"
        fill={p.main}
        opacity="0.92"
        {...o(p.dark)}
      />
      <rect x="77" y="196" width="46" height="8" rx="4" fill={p.trim} stroke={p.dark} strokeWidth="1.5" />
    </g>
  )
}

const princess = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Puffs color={p.main} dark={p.dark} r={15} />
      <path d={BODICE} fill={p.main} {...o(p.dark)} />
      <path d="M 86 162 L 114 162 L 100 198 Z" fill={p.accent} />
      <path d={GOWN_SKIRT} fill={p.main} {...o(p.dark)} />
      <path d="M 100 204 L 130 290 Q 100 297 70 290 Z" fill={p.accent} />
      <path d={GOWN_HEM} stroke={p.trim} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="76" y="199" width="48" height="10" rx="5" fill={p.trim} stroke={p.dark} strokeWidth="2" />
      <Sparkles color={p.trim} spots={[[60, 252, 5], [142, 246, 5], [50, 274, 4], [152, 272, 4]]} />
    </g>
  )
}

const rainbow = ({ item, uid }) => {
  const p = palette(item, '#60a5fa')
  const id = `${uid}-dress`
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="204" x2="0" y2="296">
          {RAINBOW.map((c, i) => (
            <stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <Puffs color="#ffffff" dark={p.dark} />
      <path d={BODICE} fill="#ffffff" {...o(p.dark)} />
      <path d={GOWN_SKIRT} fill={`url(#${id})`} {...o(p.dark)} />
      <rect x="76" y="199" width="48" height="10" rx="5" fill={p.main} stroke={p.dark} strokeWidth="2" />
      <path d="M 100 174 l 6 6 l -6 6 l -6 -6 z" fill={p.main} />
    </g>
  )
}

const sparkle = ({ item }) => {
  const p = palette(item)
  return (
    <g>
      <Puffs color={p.main} dark={p.dark} />
      <path d={BODICE} fill={p.main} {...o(p.dark)} />
      <path d={GOWN_SKIRT} fill={p.main} {...o(p.dark)} />
      <rect x="76" y="199" width="48" height="10" rx="5" fill={p.accent} stroke={p.dark} strokeWidth="2" />
      <Sparkles color={p.accent} spots={[[70, 250, 6], [100, 270, 7], [130, 245, 5], [90, 226, 4], [146, 276, 5], [56, 278, 4], [112, 292, 4]]} />
      <Sparkles color={p.accent} spots={[[84, 178, 3.5], [116, 186, 3]]} />
    </g>
  )
}

const overalls = ({ item }) => {
  const p = palette(item, '#3b82f6')
  const shirt = p.accent
  return (
    <g>
      <Puffs color={shirt} dark={p.dark} r={12} />
      <path d="M 76 158 Q 100 152 124 158 L 121 204 L 79 204 Z" fill={shirt} {...o(p.dark)} />
      <path d="M 86 174 L 80 156 M 114 174 L 120 156" stroke={p.main} strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="84" y="170" width="32" height="34" rx="4" fill={p.main} {...o(p.dark)} />
      <rect x="94" y="180" width="12" height="10" rx="2" fill={p.dark} opacity="0.5" />
      <path d="M 78 202 L 122 202 L 126 244 L 104 244 L 100 228 L 96 244 L 74 244 Z" fill={p.main} {...o(p.dark)} />
      <circle cx="86" cy="172" r="2.5" fill={p.trim} />
      <circle cx="114" cy="172" r="2.5" fill={p.trim} />
    </g>
  )
}

export const DRESS = { plain, gown, sundress, tutu, princess, rainbow, sparkle, overalls }
