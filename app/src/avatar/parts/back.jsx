// Things worn on the back — the very first layer, behind hair and body.
import { palette } from './util.js'

const o = (dark) => ({ stroke: dark, strokeWidth: 2.5, strokeLinejoin: 'round' })

const wings = ({ item }) => {
  const p = palette(item, '#e9d5ff')
  return (
    <g>
      {/* wide enough to show beside long hair (hair back spans x 35-165) */}
      <path d="M 92 174 C 62 96 -2 104 6 172 C -2 238 54 254 92 210 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 108 174 C 138 96 202 104 194 172 C 202 238 146 254 108 210 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 80 182 C 58 130 20 134 22 178 C 18 226 56 236 80 206 Z" fill={p.accent} opacity="0.8" />
      <path d="M 120 182 C 142 130 180 134 178 178 C 182 226 144 236 120 206 Z" fill={p.accent} opacity="0.8" />
    </g>
  )
}

const fairywings = ({ item }) => {
  const p = palette(item, '#bbf7d0')
  const wing = (cx, cy, rx, ry, rot) => (
    <g key={`${cx}-${cy}`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={p.main} opacity="0.9" {...o(p.dark)} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.55} ry={ry * 0.6} transform={`rotate(${rot} ${cx} ${cy})`} fill={p.accent} opacity="0.7" />
    </g>
  )
  return (
    <g>
      {wing(40, 150, 28, 46, 38)}
      {wing(160, 150, 28, 46, -38)}
      {wing(48, 218, 20, 30, -22)}
      {wing(152, 218, 20, 30, 22)}
    </g>
  )
}

const cape = ({ item }) => {
  const p = palette(item, '#ff4fb3')
  return (
    <g>
      {/* flares wider than any gown so it peeks out at the sides */}
      <path d="M 70 156 L 130 156 L 176 292 Q 100 308 24 292 Z" fill={p.main} {...o(p.dark)} />
      <path d="M 100 160 L 90 292 M 100 160 L 110 292" stroke={p.dark} strokeWidth="1.5" opacity="0.35" />
      <path d="M 70 158 Q 100 148 130 158 L 130 168 Q 100 158 70 168 Z" fill={p.accent} {...o(p.dark)} />
    </g>
  )
}

const backpack = ({ item }) => {
  const p = palette(item, '#ef4444')
  return (
    <g>
      <path d="M 86 154 Q 100 134 114 154" stroke={p.dark} strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="56" y="152" width="88" height="84" rx="18" fill={p.main} {...o(p.dark)} />
      <rect x="62" y="200" width="76" height="30" rx="10" fill={p.accent} stroke={p.dark} strokeWidth="2" />
      <path d="M 72 166 L 62 200 M 128 166 L 138 200" stroke={p.dark} strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

export const BACK = { wings, fairywings, cape, backpack }
