// Pets are emoji companions in the bottom-right corner of the doll.
// The emoji comes from item.emoji, then item.colors.emoji, then the default
// for the variant.

export const PET = {
  puppy: '🐩',
  unicorn: '🦄',
  bunny: '🐰',
  kitten: '🐱',
  bird: '🐦',
  butterfly: '🦋',
}

export function petEmoji(item) {
  return item?.emoji ?? item?.colors?.emoji ?? PET[item?.variant] ?? null
}

export function Pet({ item }) {
  const emoji = petEmoji(item)
  if (!emoji) return null
  return (
    <text x="170" y="306" fontSize="44" textAnchor="middle" style={{ userSelect: 'none' }}>
      {emoji}
    </text>
  )
}
