// PLACEHOLDER — replaced by the real layered SVG doll (see spec §Avatar).
// Props: size (px, height), className, equipped (optional override map).
import { usePlayer } from '../context/PlayerContext.jsx'

export default function Avatar({ size = 64, className = '' }) {
  const { state } = usePlayer()
  const hair = state.avatar.equipped.hair
  return (
    <span className={`inline-flex items-end justify-center ${className}`} style={{ height: size, width: size * 0.7 }} title={hair}>
      <span style={{ fontSize: size * 0.7 }}>👧</span>
    </span>
  )
}
