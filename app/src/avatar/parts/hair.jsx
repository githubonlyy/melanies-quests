// Hair styles. Each variant has a `Back` (drawn behind the body, before the
// head) and a `Front` (bangs, drawn after the face). Colors: item.colors.hair,
// optional item.colors.accent for ties/ribbons.
import { shade } from './util.js'

const RAINBOW = ['#f87171', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6']

// bangs cap: slightly bigger than the head, scalloped fringe over the forehead
const CAP_FRONT = 'M 44 100 C 40 18 160 18 156 100 C 152 84 142 72 130 78 Q 115 92 100 82 Q 85 92 70 78 C 58 72 48 84 44 100 Z'
const LONG_BACK = 'M 40 96 C 36 20 164 20 160 96 L 165 226 Q 149 242 133 227 Q 116 244 100 229 Q 84 244 67 227 Q 51 242 35 226 Z'
const BOB_BACK = 'M 36 96 C 32 20 168 20 164 96 L 166 150 Q 133 164 100 154 Q 67 164 34 150 Z'
const SHORT_BACK = 'M 42 96 C 38 22 162 22 158 96 L 158 122 Q 100 134 42 122 Z'
// strands falling in front of the shoulders (long styles)
const LOCK_L = 'M 45 96 C 34 130 36 175 46 208 L 64 206 C 56 170 55 135 60 104 Z'
const LOCK_R = 'M 155 96 C 166 130 164 175 154 208 L 136 206 C 144 170 145 135 140 104 Z'

function paint(item, uid) {
  const color = item.colors?.hair ?? '#f7d774'
  const rainbow = item.variant === 'rainbow'
  return {
    fill: rainbow ? `url(#${uid}-hair)` : color,
    dark: rainbow ? '#7c3aed' : shade(color, -0.3),
    light: rainbow ? '#ffffff' : shade(color, 0.35),
    tie: item.colors?.accent ?? '#f472b6',
    rainbow,
  }
}

const o = (dark) => ({ stroke: dark, strokeWidth: 2.5, strokeLinejoin: 'round' })

function RainbowDefs({ uid }) {
  return (
    <defs>
      <linearGradient id={`${uid}-hair`} gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="170" y2="0">
        {RAINBOW.map((c, i) => (
          <stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
  )
}

function Bangs({ p, locks = false }) {
  return (
    <g>
      {locks && <path d={LOCK_L} fill={p.fill} {...o(p.dark)} />}
      {locks && <path d={LOCK_R} fill={p.fill} {...o(p.dark)} />}
      <path d={CAP_FRONT} fill={p.fill} {...o(p.dark)} />
    </g>
  )
}

function Tie({ cx, cy, color, r = 7 }) {
  return <circle cx={cx} cy={cy} r={r} fill={color} stroke={shade(color, -0.3)} strokeWidth="2" />
}

// ---- variants ---------------------------------------------------------------

const long = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return <path d={LONG_BACK} fill={p.fill} {...o(p.dark)} />
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} locks />,
}

const rainbow = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <RainbowDefs uid={uid} />
        <path d={LONG_BACK} fill={p.fill} {...o(p.dark)} />
      </g>
    )
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} locks />,
}

const bob = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return <path d={BOB_BACK} fill={p.fill} {...o(p.dark)} />
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} />,
}

const ponytail = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <path d={SHORT_BACK} fill={p.fill} {...o(p.dark)} />
        <ellipse cx="162" cy="132" rx="17" ry="46" transform="rotate(-14 162 132)" fill={p.fill} {...o(p.dark)} />
        <Tie cx={159} cy={84} color={p.tie} />
      </g>
    )
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} />,
}

const pigtails = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <path d={SHORT_BACK} fill={p.fill} {...o(p.dark)} />
        <ellipse cx="38" cy="154" rx="16" ry="42" transform="rotate(12 38 154)" fill={p.fill} {...o(p.dark)} />
        <ellipse cx="162" cy="154" rx="16" ry="42" transform="rotate(-12 162 154)" fill={p.fill} {...o(p.dark)} />
        <Tie cx={43} cy={112} color={p.tie} />
        <Tie cx={157} cy={112} color={p.tie} />
      </g>
    )
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} />,
}

function Braid({ x, p, dir }) {
  const beads = []
  for (let k = 0; k < 7; k++) {
    beads.push(<circle key={k} cx={x + (k % 2 === 0 ? 3 : -3) * dir} cy={104 + k * 15} r="9.5" fill={p.fill} {...o(p.dark)} />)
  }
  return (
    <g>
      {beads}
      <circle cx={x} cy={214} r="5.5" fill={p.fill} {...o(p.dark)} />
      <Tie cx={x} cy={206} color={p.tie} r={5.5} />
    </g>
  )
}

const braids = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <path d={SHORT_BACK} fill={p.fill} {...o(p.dark)} />
        <Braid x={42} p={p} dir={1} />
        <Braid x={158} p={p} dir={-1} />
      </g>
    )
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} />,
}

const CURLS_BACK = [
  [34, 112, 17], [28, 142, 16], [34, 172, 15], [46, 198, 14], [62, 214, 13],
  [166, 112, 17], [172, 142, 16], [166, 172, 15], [154, 198, 14], [138, 214, 13],
]
const CURLS_FRONT = [[54, 68, 15], [74, 52, 16], [100, 46, 17], [126, 52, 16], [146, 68, 15], [44, 92, 13], [156, 92, 13]]

const curly = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <path d={SHORT_BACK} fill={p.fill} {...o(p.dark)} />
        {CURLS_BACK.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.fill} {...o(p.dark)} />
        ))}
      </g>
    )
  },
  Front: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <Bangs p={p} />
        {CURLS_FRONT.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.fill} {...o(p.dark)} />
        ))}
      </g>
    )
  },
}

const bun = {
  Back: ({ item, uid }) => {
    const p = paint(item, uid)
    return (
      <g>
        <path d={SHORT_BACK} fill={p.fill} {...o(p.dark)} />
        <circle cx="100" cy="38" r="21" fill={p.fill} {...o(p.dark)} />
        <path d="M 88 36 Q 100 22 112 36" stroke={p.light} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    )
  },
  Front: ({ item, uid }) => <Bangs p={paint(item, uid)} />,
}

export const HAIR = { long, bob, ponytail, pigtails, braids, curly, bun, rainbow }
