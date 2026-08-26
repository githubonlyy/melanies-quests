// Hand-held items, held in the right hand at (140, 230).
import { palette, starPath } from './util.js'

const o = (dark) => ({ stroke: dark, strokeWidth: 2.5, strokeLinejoin: 'round' })

const wand = ({ item }) => {
  const p = palette(item, '#fde047')
  return (
    <g>
      <path d="M 138 236 L 166 180" stroke={p.dark} strokeWidth="7" strokeLinecap="round" />
      <path d="M 138 236 L 166 180" stroke={p.accent} strokeWidth="4" strokeLinecap="round" />
      <path d={starPath(168, 172, 15)} fill={p.main} {...o(p.dark)} />
      <path d={starPath(184, 192, 4.5)} fill={p.main} />
      <path d={starPath(150, 168, 4)} fill={p.main} />
      <path d={starPath(186, 160, 3.5)} fill={p.accent} />
    </g>
  )
}

const purse = ({ item }) => {
  const p = palette(item, '#ff4fb3')
  return (
    <g>
      <path d="M 147 234 Q 161 212 175 234" stroke={p.dark} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="146" y="232" width="30" height="24" rx="8" fill={p.main} {...o(p.dark)} />
      <path d="M 146 242 L 176 242" stroke={p.dark} strokeWidth="2" />
      <circle cx="161" cy="242" r="3.5" fill={p.accent} stroke={p.dark} strokeWidth="1.5" />
    </g>
  )
}

const bouquet = ({ item }) => {
  const p = palette(item, '#f472b6')
  return (
    <g>
      <path d="M 140 232 L 152 200 M 140 232 L 162 206 M 140 232 L 144 198" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="150" cy="214" rx="5" ry="2.5" fill="#4ade80" transform="rotate(-40 150 214)" />
      <ellipse cx="158" cy="220" rx="5" ry="2.5" fill="#4ade80" transform="rotate(30 158 220)" />
      <path d="M 133 238 L 148 208 L 164 218 L 148 244 Z" fill="#fef3c7" stroke="#d6a06b" strokeWidth="2.5" strokeLinejoin="round" />
      {[[152, 194], [164, 202], [142, 194], [156, 184]].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="8" fill={i % 2 ? p.accent : p.main} {...o(p.dark)} />
          <circle cx={x} cy={y} r="3" fill={p.trim} />
        </g>
      ))}
    </g>
  )
}

const balloon = ({ item }) => {
  const p = palette(item, '#ef4444')
  return (
    <g>
      <path d="M 140 226 Q 152 200 162 178" stroke="#475569" strokeWidth="1.8" fill="none" />
      <ellipse cx="163" cy="150" rx="21" ry="26" fill={p.main} {...o(p.dark)} />
      <path d="M 158 176 L 163 172 L 168 176 Z" fill={p.dark} />
      <ellipse cx="155" cy="140" rx="4" ry="8" fill="#ffffff" opacity="0.5" transform="rotate(20 155 140)" />
    </g>
  )
}

const icecream = ({ item }) => {
  const p = palette(item, '#fbcfe8')
  const cone = item.colors?.accent ?? '#d6a06b'
  return (
    <g>
      <path d="M 150 264 L 139 232 L 161 232 Z" fill={cone} stroke="#8b5a2b" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 143 240 L 157 248 M 145 248 L 155 240 M 147 256 L 153 250" stroke="#8b5a2b" strokeWidth="1.5" opacity="0.6" />
      <circle cx="150" cy="226" r="12" fill={p.main} {...o(p.dark)} />
      <circle cx="150" cy="210" r="10" fill="#fff7ed" stroke="#e7c9a5" strokeWidth="2.5" />
      <circle cx="150" cy="198" r="3.5" fill="#ef4444" />
    </g>
  )
}

const book = ({ item }) => {
  const p = palette(item, '#3b82f6')
  return (
    <g>
      <rect x="142" y="214" width="30" height="32" rx="3" fill={p.main} {...o(p.dark)} />
      <rect x="147" y="218" width="21" height="24" rx="1.5" fill={p.accent} />
      <path d="M 152 224 L 163 224 M 152 229 L 163 229 M 152 234 L 160 234" stroke={p.dark} strokeWidth="1.5" opacity="0.6" />
      <path d="M 145 214 L 145 246" stroke={p.dark} strokeWidth="2" />
    </g>
  )
}

export const HAND = { wand, purse, bouquet, balloon, icecream, book }
