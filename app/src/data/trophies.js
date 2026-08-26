// Trophy definitions. `check(state)` runs against the freshly-updated player
// state inside the reducer; a trophy is earned once and keeps its timestamp.
export const TROPHIES = [
  {
    id: 'first-win',
    icon: 'trophy',
    title: 'ניצחון ראשון',
    he: 'הניצחון הראשון שלך!',
    check: (s) => s.stats.totalWins >= 1,
  },
  {
    id: 'perfect',
    icon: 'target',
    title: 'מושלם!',
    he: 'משחק מושלם — בלי אף טעות!',
    check: (s) => s.stats.perfectCount >= 1,
  },
  {
    id: 'streak-3',
    icon: 'flame',
    title: '3 ימים ברצף',
    he: 'שיחקת 3 ימים ברצף!',
    check: (s) => s.streak.best >= 3,
  },
  {
    id: 'streak-7',
    icon: 'crown',
    title: 'שבוע שלם',
    he: 'שבוע שלם ברצף!',
    check: (s) => s.streak.best >= 7,
  },
  {
    id: 'master-letters',
    icon: 'letters',
    title: 'מלכת האותיות',
    he: '5 ניצחונות באותיות',
    check: (s) => (s.stats.winsBySubject.letters || 0) >= 5,
  },
  {
    id: 'master-reading',
    icon: 'book',
    title: 'קוראת אלופה',
    he: '5 ניצחונות בקריאה',
    check: (s) => (s.stats.winsBySubject.reading || 0) >= 5,
  },
  {
    id: 'master-counting',
    icon: 'hash',
    title: 'סופרת גדולה',
    he: '5 ניצחונות בספירה',
    check: (s) => (s.stats.winsBySubject.counting || 0) >= 5,
  },
  {
    id: 'master-math',
    icon: 'calculator',
    title: 'מלכת החשבון',
    he: '5 ניצחונות בחשבון',
    check: (s) => (s.stats.winsBySubject.math || 0) >= 5,
  },
  {
    id: 'master-shapes',
    icon: 'shapes',
    title: 'אמנית הצורות',
    he: '5 ניצחונות בצורות',
    check: (s) => (s.stats.winsBySubject.shapes || 0) >= 5,
  },
  {
    id: 'master-compare',
    icon: 'scale',
    title: 'גדול וקטן',
    he: '5 ניצחונות בגדול וקטן',
    check: (s) => (s.stats.winsBySubject.compare || 0) >= 5,
  },
  {
    id: 'rich',
    icon: 'coins',
    title: 'עשירה!',
    he: 'הגעת ל-1,000 מטבעות!',
    check: (s) => s.coins >= 1000,
  },
  {
    id: 'fashionista',
    icon: 'shirt',
    title: 'אופנתית',
    he: 'קנית 5 בגדים לארון!',
    check: (s) => s.avatar.owned.length >= 5 + 4, // 4 free starter items
  },
  {
    id: 'shopper',
    icon: 'bag',
    title: 'פרס אמיתי',
    he: 'הפרס האמיתי הראשון שלך!',
    check: (s) => s.purchases.some((p) => p.kind === 'reward'),
  },
  {
    id: 'chest-hunter',
    icon: 'gift',
    title: 'ציידת אוצרות',
    he: 'פתחת את תיבת האוצר היומית!',
    check: (s) => s.stats.chestsOpened >= 1,
  },
]

// returns an updated {id: ts} map including any newly-earned trophies
export function evaluateTrophies(state) {
  let changed = false
  const next = { ...state.trophies }
  for (const t of TROPHIES) {
    if (!next[t.id] && t.check(state)) {
      next[t.id] = Date.now()
      changed = true
    }
  }
  return changed ? next : state.trophies
}
