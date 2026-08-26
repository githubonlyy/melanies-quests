// Head accessories — drawn after the bangs, around the top of the head
// (head top is y 44, hair cap top ~y 38).
import { palette, starPath } from './util.js'

const o = (dark) => ({ stroke: dark, strokeWidth: 2.5, strokeLinejoin: 'round' })

const tiara = ({ item }) => {
  const p = palette(item, '#facc15')
  return (
    <g>
      <path d="M 70 64 L 77 42 L 88 56 L 100 32 L 112 56 L 123 42 L 130 64 Q 100 54 70 64 Z" fill={p.main} {...o(p.dark)} />
      <circle cx="100" cy="50" r="4.5" fill={p.accent} stroke={p.dark} strokeWidth="1.5" />
      <circle cx="80" cy="56" r="2.5" fill={p.accent} />
      <circle cx="120" cy="56" r="2.5" fill={p.accent} />
    </g>
  )
}

const crown = ({ item }) => {
  const p = palette(item, '#facc15')
  return (
    <g>
      <path d="M 62 66 L 64 32 L 80 50 L 100 22 L 120 50 L 136 32 L 138 66 Z" fill={p.main} {...o(p.dark)} />
      <rect x="62" y="58" width="76" height="11" rx="3" fill={p.main} {...o(p.dark)} />
      <circle cx="64" cy="32" r="4" fill={p.accent} stroke={p.dark} strokeWidth="1.5" />
      <circle cx="100" cy="22" r="4.5" fill={p.accent} stroke={p.dark} strokeWidth="1.5" />
      <circle cx="136" cy="32" r="4" fill={p.accent} stroke={p.dark} strokeWidth="1.5" />
      <circle cx="100" cy="63.5" r="4" fill={p.accent} />
      <circle cx="80" cy="63.5" r="2.5" fill={p.accent} />
      <circle cx="120" cy="63.5" r="2.5" fill={p.accent} />
    </g>
  )
}

const bow = ({ item }) => {
  const p = palette(item, '#ef4444')
  return (
    <g>
      <path d="M 140 72 L 146 58 L 152 76 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 152 72 L 148 58 L 160 74 Z" fill={p.main} {...o(p.dark)} />
      <ellipse cx="132" cy="52" rx="16" ry="11" transform="rotate(-20 132 52)" fill={p.main} {...o(p.dark)} />
      <ellipse cx="162" cy="52" rx="16" ry="11" transform="rotate(20 162 52)" fill={p.main} {...o(p.dark)} />
      <circle cx="147" cy="56" r="6" fill={p.accent} stroke={p.dark} strokeWidth="2" />
    </g>
  )
}

// horn width goes 16 -> 0 from y 52 up to y 2
const HORN_STRIPES = [44, 34, 24, 14]
const horn = ({ item }) => {
  const p = palette(item, '#fde68a')
  return (
    <g>
      <path d="M 92 52 L 100 2 L 108 52 Z" fill={p.main} {...o(p.dark)} />
      {HORN_STRIPES.map((y) => {
        const half = (8 * (y - 2)) / 50 - 1
        return <path key={y} d={`M ${100 - half} ${y} L ${100 + half} ${y - 2}`} stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" />
      })}
    </g>
  )
}

function Flower({ cx, cy, color, center, r = 5 }) {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const a = (deg * Math.PI) / 180
    return <circle key={deg} cx={cx + Math.cos(a) * r * 1.1} cy={cy + Math.sin(a) * r * 1.1} r={r} fill={color} />
  })
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.7} fill={center} />
    </g>
  )
}

const FLOWERS = [[60, 70], [76, 52], [100, 42], [124, 52], [140, 70]]
const flowercrown = ({ item }) => {
  const p = palette(item, '#f9a8d4')
  return (
    <g>
      <path d="M 52 78 C 60 38 140 38 148 78" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[[68, 60], [88, 45], [112, 45], [132, 60]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="6" ry="3" fill="#4ade80" transform={`rotate(${x < 100 ? -40 : 40} ${x} ${y})`} />
      ))}
      {FLOWERS.map(([x, y], i) => (
        <Flower key={`${x}-${y}`} cx={x} cy={y} color={i % 2 ? p.accent : p.main} center={i % 2 ? p.main : p.trim} />
      ))}
    </g>
  )
}

const headband = ({ item }) => {
  const p = palette(item, '#60a5fa')
  return (
    <g>
      <path d="M 48 82 C 52 26 148 26 152 82" stroke={p.dark} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 48 82 C 52 26 148 26 152 82" stroke={p.main} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={starPath(132, 46, 10)} fill={p.accent} {...o(p.dark)} />
    </g>
  )
}

const hat = ({ item }) => {
  const p = palette(item, '#fcd34d')
  return (
    <g>
      <ellipse cx="100" cy="62" rx="76" ry="14" fill={p.main} {...o(p.dark)} />
      <path d="M 52 62 C 52 20 148 20 148 62 Z" fill={p.main} {...o(p.dark)} />
      <rect x="55" y="51" width="90" height="9" fill={p.accent} />
      <circle cx="132" cy="55" r="6" fill={p.accent} stroke={p.dark} strokeWidth="2" />
    </g>
  )
}

const catEars = ({ item }) => {
  const p = palette(item, '#2b2118')
  return (
    <g>
      <path d="M 50 72 L 56 28 L 86 52 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 150 72 L 144 28 L 114 52 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 58 64 L 61 40 L 78 54 Z" fill={p.accent} />
      <path d="M 142 64 L 139 40 L 122 54 Z" fill={p.accent} />
    </g>
  )
}

export const HEAD = { tiara, crown, bow, horn, flowercrown, headband, hat, 'cat-ears': catEars }
