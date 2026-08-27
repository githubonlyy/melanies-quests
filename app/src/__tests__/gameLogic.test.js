import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  reducer,
  DEFAULT_STATE,
  levelCost,
  applyXp,
  businessDate,
  defaultAvatar,
  repairAvatar,
  getEquipped,
  AVATAR_SLOTS,
  REQUIRED_SLOTS,
} from '../context/PlayerContext.jsx'
import { THEMES, THEME_IDS, THEME_VAR_KEYS, DEFAULT_THEME } from '../data/themes.js'
import { EVENTS, MODES } from '../data/events.js'
import { TROPHIES } from '../data/trophies.js'
import wardrobe from '../data/wardrobe.json'
import config from '../data/config.json'

const fresh = () => structuredClone(DEFAULT_STATE)

// engine-shaped MATCH_RESULT action
const match = (over = {}) => ({
  type: 'MATCH_RESULT',
  eventId: 'math',
  subject: 'חשבון',
  result: 'WIN',
  correct: 7,
  total: 8,
  coinsEarned: 120,
  xpEarned: 70,
  avgTimeSec: 6.5,
  practice: false,
  ...over,
})

// fixed local times (month is 0-based)
const DAY1_10AM = new Date(2026, 8, 1, 10, 0, 0)
const DAY2_10AM = new Date(2026, 8, 2, 10, 0, 0)
const DAY4_10AM = new Date(2026, 8, 4, 10, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(DAY1_10AM)
})
afterEach(() => vi.useRealTimers())

describe('config — first-grade tuning', () => {
  it('has no per-question timer and no speed bonus', () => {
    expect(config.questionTimerSec).toBe(0)
    expect(config.speedBonusCoins).toBe(0)
  })
  it('win/draw thresholds fit an 8-question match', () => {
    expect(config.questionsPerMatch).toBe(8)
    expect(config.winThreshold).toBeLessThanOrEqual(config.questionsPerMatch)
    expect(config.drawThreshold).toBeLessThan(config.winThreshold)
  })
})

describe('level curve', () => {
  it('levelCost grows linearly', () => {
    expect(levelCost(1)).toBe(300)
    expect(levelCost(5)).toBe(700)
  })

  it('applyXp carries leftover into the next level', () => {
    const r = applyXp({ xp: 290, level: 1 }, 20) // cost 300 -> 310 total
    expect(r.level).toBe(2)
    expect(r.xp).toBe(10)
    expect(r.leveledUp).toBe(true)
  })
})

describe('businessDate (day flips at 05:00)', () => {
  it('3 AM still belongs to the previous day', () => {
    expect(businessDate(new Date(2026, 8, 2, 3, 0))).toBe('2026-09-01')
  })
  it('6 AM belongs to the current day', () => {
    expect(businessDate(new Date(2026, 8, 2, 6, 0))).toBe('2026-09-02')
  })
})

describe('MATCH_RESULT', () => {
  it('paid match adds coins, xp, daily play, log entry', () => {
    const s = reducer(fresh(), match())
    expect(s.coins).toBe(120)
    expect(s.dailyPlays.math).toBe(businessDate())
    expect(s.battleLog).toHaveLength(1)
    expect(s.battleLog[0]).toMatchObject({ subject: 'חשבון', result: 'WIN', correct: 7, total: 8, coins: 120 })
  })

  it('practice gives xp but no coins and no daily-play mark', () => {
    const s = reducer(fresh(), match({ practice: true }))
    expect(s.coins).toBe(0)
    expect(s.dailyPlays.math).toBeUndefined()
    expect(s.battleLog[0].coins).toBe(0)
    expect(s.xp).toBeGreaterThan(0)
  })

  it('battle log caps at 100 entries', () => {
    let s = fresh()
    for (let i = 0; i < 105; i++) s = reducer(s, match())
    expect(s.battleLog).toHaveLength(100)
  })

  it('tracks win stats per subject and perfect counts (8/8)', () => {
    let s = reducer(fresh(), match({ correct: 8 })) // win + perfect
    s = reducer(s, match({ eventId: 'letters', subject: 'אותיות', result: 'LOSS', correct: 2 }))
    expect(s.stats.totalWins).toBe(1)
    expect(s.stats.perfectCount).toBe(1)
    expect(s.stats.winsBySubject.math).toBe(1)
    expect(s.stats.winsBySubject.letters).toBeUndefined()
  })
})

describe('streak', () => {
  it('same-day matches count once; consecutive days grow; gaps reset', () => {
    let s = reducer(fresh(), match())
    s = reducer(s, match()) // same day again
    expect(s.streak.count).toBe(1)

    vi.setSystemTime(DAY2_10AM)
    s = reducer(s, match())
    expect(s.streak.count).toBe(2)
    expect(s.streak.best).toBe(2)

    vi.setSystemTime(DAY4_10AM) // skipped a day
    s = reducer(s, match())
    expect(s.streak.count).toBe(1)
    expect(s.streak.best).toBe(2)
  })

  it('practice does not advance the streak', () => {
    const s = reducer(fresh(), match({ practice: true }))
    expect(s.streak.count).toBe(0)
  })
})

describe('trophies', () => {
  it('first win and perfect match award trophies', () => {
    const s = reducer(fresh(), match({ correct: 8 }))
    expect(s.trophies['first-win']).toBeDefined()
    expect(s.trophies.perfect).toBeDefined()
  })

  it('rich trophy at 1000 coins', () => {
    const s = reducer(fresh(), match({ coinsEarned: 1200 }))
    expect(s.trophies.rich).toBeDefined()
  })

  it('every subject has a master trophy keyed by its event id', () => {
    for (const e of EVENTS) {
      expect(TROPHIES.find((t) => t.id === `master-${e.id}`), e.id).toBeDefined()
    }
  })
})

describe('BUY (real-world rewards)', () => {
  const item = { id: 'new-toy', title: 'צעצוע חדש', cost: 500 }

  it('deducts coins, logs purchase with kind, awards shopper trophy', () => {
    let s = { ...fresh(), coins: 600 }
    s = reducer(s, { type: 'BUY', item })
    expect(s.coins).toBe(100)
    expect(s.purchases[0]).toMatchObject({ title: 'צעצוע חדש', kind: 'reward' })
    expect(s.trophies.shopper).toBeDefined()
  })

  it('insufficient funds is a no-op', () => {
    const s0 = { ...fresh(), coins: 100 }
    expect(reducer(s0, { type: 'BUY', item })).toBe(s0)
  })
})

describe('avatar defaults', () => {
  it('owns every free wardrobe item and fills required slots in every world', () => {
    const a = defaultAvatar()
    const free = wardrobe.filter((i) => i.price === 0).map((i) => i.id)
    expect(a.owned).toEqual(free)
    for (const id of THEME_IDS) {
      for (const slot of REQUIRED_SLOTS) expect(a.equippedByTheme[id][slot], `${id} ${slot}`).toBeTruthy()
      for (const slot of AVATAR_SLOTS) expect(slot in a.equippedByTheme[id]).toBe(true)
    }
  })

  it('each world starts with a different outfit (theme-tagged free items win)', () => {
    const a = defaultAvatar()
    const dresses = THEME_IDS.map((id) => a.equippedByTheme[id].dress)
    expect(new Set(dresses).size).toBe(THEME_IDS.length)
    expect(wardrobe.find((i) => i.id === a.equippedByTheme.unicorn.dress).theme).toBe('unicorn')
  })

  it('wardrobe has at least one free item per required slot', () => {
    for (const slot of REQUIRED_SLOTS) {
      expect(wardrobe.some((i) => i.slot === slot && i.price === 0), slot).toBe(true)
    }
  })

  it('wardrobe ids are unique and slots are known', () => {
    const ids = wardrobe.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const i of wardrobe) expect(AVATAR_SLOTS, i.id).toContain(i.slot)
  })
})

describe('WARDROBE_BUY / AVATAR_EQUIP', () => {
  const dress = { id: 'test-dress', slot: 'dress', name: 'שמלת בדיקה', price: 300 }
  const crown = { id: 'test-crown', slot: 'head', name: 'כתר בדיקה', price: 200 }

  it('buy deducts, owns, equips immediately in that world only, logs 👗', () => {
    let s = { ...fresh(), coins: 500 }
    s = reducer(s, { type: 'WARDROBE_BUY', themeId: 'unicorn', item: dress })
    expect(s.coins).toBe(200)
    expect(s.avatar.owned).toContain('test-dress')
    expect(getEquipped(s, 'unicorn').dress).toBe('test-dress')
    expect(getEquipped(s, 'barbie').dress).not.toBe('test-dress')
    expect(s.purchases[0]).toMatchObject({ title: '👗 שמלת בדיקה', cost: 300, kind: 'wardrobe' })
  })

  it('double-buy and poor are no-ops', () => {
    let s = { ...fresh(), coins: 500 }
    s = reducer(s, { type: 'WARDROBE_BUY', item: dress })
    expect(reducer(s, { type: 'WARDROBE_BUY', item: dress })).toBe(s)
    const poor = { ...fresh(), coins: 10 }
    expect(reducer(poor, { type: 'WARDROBE_BUY', item: dress })).toBe(poor)
  })

  it('equip only owned items; required slots cannot be emptied; optional can; worlds independent', () => {
    let s = { ...fresh(), coins: 1000 }
    const before = s
    expect(reducer(s, { type: 'AVATAR_EQUIP', themeId: 'barbie', slot: 'dress', itemId: 'test-dress' })).toBe(before) // not owned
    s = reducer(s, { type: 'WARDROBE_BUY', themeId: 'barbie', item: dress })
    s = reducer(s, { type: 'WARDROBE_BUY', themeId: 'barbie', item: crown })
    // an owned item can be worn in another world too
    s = reducer(s, { type: 'AVATAR_EQUIP', themeId: 'flowers', slot: 'head', itemId: 'test-crown' })
    expect(getEquipped(s, 'flowers').head).toBe('test-crown')
    expect(getEquipped(s, 'unicorn').head).toBeNull()
    const firstDress = defaultAvatar().equippedByTheme.barbie.dress
    s = reducer(s, { type: 'AVATAR_EQUIP', themeId: 'barbie', slot: 'dress', itemId: firstDress })
    expect(getEquipped(s, 'barbie').dress).toBe(firstDress)
    expect(reducer(s, { type: 'AVATAR_EQUIP', themeId: 'barbie', slot: 'dress', itemId: null })).toBe(s)
    s = reducer(s, { type: 'AVATAR_EQUIP', themeId: 'barbie', slot: 'head', itemId: null })
    expect(getEquipped(s, 'barbie').head).toBeNull()
    // unknown world falls back to the default one instead of crashing
    expect(reducer(s, { type: 'AVATAR_EQUIP', themeId: 'nope', slot: 'head', itemId: 'test-crown' }).avatar.equippedByTheme[DEFAULT_THEME].head).toBe('test-crown')
  })

  it('fashionista trophy after 5 bought items', () => {
    let s = { ...fresh(), coins: 10000 }
    for (let i = 0; i < 5; i++) s = reducer(s, { type: 'WARDROBE_BUY', item: { id: `x${i}`, slot: 'head', name: `x${i}`, price: 10 } })
    expect(s.trophies.fashionista).toBeDefined()
  })

  it('repairAvatar drops unknown ids, refills required slots, migrates the old single-outfit shape', () => {
    const broken = { owned: ['ghost-item', 'skin-light', 'shoes-basic'], equipped: { skin: 'ghost', hair: null, dress: 'skin-light', head: 'ghost', shoes: 'shoes-basic' } }
    const fixed = repairAvatar(broken)
    expect(fixed.owned).not.toContain('ghost-item')
    expect(fixed.equipped).toBeUndefined()
    for (const id of THEME_IDS) {
      const eq = fixed.equippedByTheme[id]
      for (const slot of REQUIRED_SLOTS) expect(eq[slot], `${id} ${slot}`).toBeTruthy()
      expect(eq.head).toBeNull()
      // an owned item in the wrong slot is a bug in saved data; required slot still ends up valid
      expect(wardrobe.find((i) => i.id === eq.dress).slot).toBe('dress')
      expect(eq.shoes).toBe('shoes-basic') // legacy outfit carried into every world
    }
  })
})

describe('CHEST_CLAIM', () => {
  it('adds coins once per business day', () => {
    let s = reducer(fresh(), { type: 'CHEST_CLAIM', amount: config.dailyChestCoins })
    expect(s.coins).toBe(100)
    expect(s.stats.chestsOpened).toBe(1)
    expect(s.trophies['chest-hunter']).toBeDefined()

    const again = reducer(s, { type: 'CHEST_CLAIM', amount: config.dailyChestCoins })
    expect(again).toBe(s) // same-day double claim rejected
  })
})

describe('arcade', () => {
  const game = { id: 'flappy', title: 'חד-קרן מעופף', price: 1500 }

  it('catch is owned from the start', () => {
    expect(fresh().ownedGames).toContain('catch')
  })

  it('ARCADE_BUY deducts, unlocks permanently, logs; double-buy and poor no-op', () => {
    let s = { ...fresh(), coins: 2000 }
    s = reducer(s, { type: 'ARCADE_BUY', game })
    expect(s.coins).toBe(500)
    expect(s.ownedGames).toContain('flappy')
    expect(s.purchases[0]).toMatchObject({ cost: 1500, kind: 'arcade' })

    expect(reducer(s, { type: 'ARCADE_BUY', game })).toBe(s) // already owned
    const poor = { ...fresh(), coins: 10 }
    expect(reducer(poor, { type: 'ARCADE_BUY', game })).toBe(poor)
  })

  it('ARCADE_SCORE keeps only the best score', () => {
    let s = reducer(fresh(), { type: 'ARCADE_SCORE', game: 'catch', score: 120 })
    expect(s.arcadeHighScores.catch).toBe(120)
    const lower = reducer(s, { type: 'ARCADE_SCORE', game: 'catch', score: 80 })
    expect(lower).toBe(s)
  })
})

describe('themes registry', () => {
  it('has exactly the three worlds and a valid default', () => {
    expect(THEME_IDS.sort()).toEqual(['barbie', 'flowers', 'unicorn'])
    expect(THEMES[DEFAULT_THEME]).toBeDefined()
  })

  it('every theme defines every CSS var, confetti, particles and 4 arcade skins', () => {
    for (const id of THEME_IDS) {
      const t = THEMES[id]
      expect(t.id).toBe(id)
      for (const k of THEME_VAR_KEYS) expect(t.vars[k], `${id} ${k}`).toBeTruthy()
      expect(t.confetti.length).toBeGreaterThanOrEqual(4)
      expect(t.particles.length).toBeGreaterThanOrEqual(3)
      for (const g of ['catch', 'flappy', 'breaker', 'whack']) {
        expect(t.arcade[g]?.title, `${id} arcade.${g}`).toBeTruthy()
        expect(t.arcade[g]?.he, `${id} arcade.${g}.he`).toBeTruthy()
      }
    }
  })

  it('avatar presets only reference wardrobe items that exist', () => {
    const ids = new Set(wardrobe.map((i) => i.id))
    for (const id of THEME_IDS) {
      for (const [slot, itemId] of Object.entries(THEMES[id].avatarPreset)) {
        expect(AVATAR_SLOTS).toContain(slot)
        expect(ids.has(itemId), `${id} preset ${slot}=${itemId}`).toBe(true)
      }
    }
  })
})

describe('events registry', () => {
  it('ids unique, modes known, classic always present', () => {
    const ids = EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of EVENTS) {
      expect(e.modes[0]).toBe('classic')
      for (const m of e.modes) expect(MODES[m], `${e.id} mode ${m}`).toBeDefined()
      expect(e.widget).toBeTruthy()
    }
  })
})
