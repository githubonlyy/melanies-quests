import { createContext, useContext, useEffect, useReducer } from 'react'
import config from '../data/config.json'
import wardrobe from '../data/wardrobe.json'
import { evaluateTrophies } from '../data/trophies.js'

const STORAGE_KEY = 'melanies-quests-v1'

// Avatar slots. Required slots always have something equipped; optional ones
// may be null (nothing on her head, no wings, no pet).
export const AVATAR_SLOTS = ['skin', 'hair', 'dress', 'shoes', 'head', 'hand', 'back', 'pet']
export const REQUIRED_SLOTS = ['skin', 'hair', 'dress', 'shoes']

// exported for tests: free items are owned from day one and dress the default doll
export function defaultAvatar(items = wardrobe) {
  const free = items.filter((i) => i.price === 0)
  const equipped = {}
  for (const slot of AVATAR_SLOTS) {
    equipped[slot] = free.find((i) => i.slot === slot)?.id ?? null
  }
  return { owned: free.map((i) => i.id), equipped }
}

// exported for tests
export const DEFAULT_STATE = {
  version: 1,
  coins: 0,
  xp: 0, // progress inside current level
  level: 1,
  pin: config.defaultPin,
  dailyPlays: {}, // eventId -> business date string of last PAID play
  battleLog: [], // newest first, capped at 100
  purchases: [], // newest first (real rewards, wardrobe, arcade games)
  stats: { totalWins: 0, perfectCount: 0, winsBySubject: {}, chestsOpened: 0 },
  streak: { count: 0, best: 0, lastDate: null }, // paid-play daily streak
  chestClaimed: null, // business date the daily chest was opened
  trophies: {}, // trophyId -> earned timestamp
  ownedGames: ['catch'], // arcade games bought with coins (catch is free)
  arcadeHighScores: {}, // gameId -> best score
  avatar: defaultAvatar(), // { owned: [itemId], equipped: { slot: itemId|null } }
  corrupt: false,
}

// XP needed to go from `level` to `level + 1`
export function levelCost(level) {
  return 200 + 100 * level
}

// "Game day" flips at dailyResetHour (05:00), not midnight
export function businessDate(now = new Date()) {
  const shifted = new Date(now.getTime() - config.dailyResetHour * 3600 * 1000)
  const y = shifted.getFullYear()
  const m = String(shifted.getMonth() + 1).padStart(2, '0')
  const d = String(shifted.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function applyXp(state, gained) {
  let { xp, level } = state
  xp += gained
  while (xp >= levelCost(level)) {
    xp -= levelCost(level)
    level += 1
  }
  return { xp, level, leveledUp: level > state.level }
}

// exported for tests
export function reducer(state, action) {
  switch (action.type) {
    case 'MATCH_RESULT': {
      const { eventId, subject, result, correct, total, coinsEarned, xpEarned, avgTimeSec, practice } = action
      const { xp, level } = applyXp(state, xpEarned)
      const entry = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        ts: Date.now(),
        subject,
        result,
        correct,
        total: total ?? config.questionsPerMatch,
        coins: practice ? 0 : coinsEarned,
        avgTimeSec,
        practice,
      }
      // aggregate counters (trophies read these — battleLog is capped at 100)
      const isWin = result === 'WIN'
      const stats = {
        ...state.stats,
        totalWins: state.stats.totalWins + (isWin ? 1 : 0),
        perfectCount: state.stats.perfectCount + (correct === (total ?? config.questionsPerMatch) ? 1 : 0),
        winsBySubject: isWin
          ? { ...state.stats.winsBySubject, [eventId]: (state.stats.winsBySubject[eventId] || 0) + 1 }
          : state.stats.winsBySubject,
      }

      // paid-play daily streak
      let streak = state.streak
      if (!practice) {
        const today = businessDate()
        if (streak.lastDate !== today) {
          const yesterday = businessDate(new Date(Date.now() - 24 * 3600 * 1000))
          const count = streak.lastDate === yesterday ? streak.count + 1 : 1
          streak = { count, best: Math.max(streak.best, count), lastDate: today }
        }
      }

      const next = {
        ...state,
        coins: practice ? state.coins : state.coins + coinsEarned,
        xp,
        level,
        dailyPlays: practice ? state.dailyPlays : { ...state.dailyPlays, [eventId]: businessDate() },
        battleLog: [entry, ...state.battleLog].slice(0, 100),
        stats,
        streak,
      }
      return { ...next, trophies: evaluateTrophies(next) }
    }
    case 'CHEST_CLAIM': {
      const today = businessDate()
      if (state.chestClaimed === today) return state
      const next = {
        ...state,
        coins: state.coins + action.amount,
        chestClaimed: today,
        stats: { ...state.stats, chestsOpened: state.stats.chestsOpened + 1 },
      }
      return { ...next, trophies: evaluateTrophies(next) }
    }
    case 'BUY': {
      const { item } = action
      if (state.coins < item.cost) return state // funds re-checked at dispatch time
      const purchase = { id: Date.now() + '-' + item.id, ts: Date.now(), title: item.title, cost: item.cost, kind: 'reward' }
      const next = { ...state, coins: state.coins - item.cost, purchases: [purchase, ...state.purchases] }
      return { ...next, trophies: evaluateTrophies(next) }
    }
    case 'WARDROBE_BUY': {
      const { item } = action // { id, slot, name, price }
      if (state.avatar.owned.includes(item.id) || state.coins < item.price) return state
      const purchase = { id: Date.now() + '-' + item.id, ts: Date.now(), title: `👗 ${item.name}`, cost: item.price, kind: 'wardrobe' }
      const next = {
        ...state,
        coins: state.coins - item.price,
        purchases: [purchase, ...state.purchases],
        avatar: {
          owned: [...state.avatar.owned, item.id],
          equipped: { ...state.avatar.equipped, [item.slot]: item.id }, // wear it right away
        },
      }
      return { ...next, trophies: evaluateTrophies(next) }
    }
    case 'AVATAR_EQUIP': {
      const { slot, itemId } = action // itemId null = take it off (optional slots only)
      if (!AVATAR_SLOTS.includes(slot)) return state
      if (itemId === null && REQUIRED_SLOTS.includes(slot)) return state
      if (itemId !== null && !state.avatar.owned.includes(itemId)) return state
      if (state.avatar.equipped[slot] === itemId) return state
      return { ...state, avatar: { ...state.avatar, equipped: { ...state.avatar.equipped, [slot]: itemId } } }
    }
    case 'ARCADE_SCORE': {
      const prev = state.arcadeHighScores[action.game] || 0
      if (action.score <= prev) return state
      return { ...state, arcadeHighScores: { ...state.arcadeHighScores, [action.game]: action.score } }
    }
    case 'ARCADE_BUY': {
      const { game } = action // { id, title, price }
      if (state.ownedGames.includes(game.id) || state.coins < game.price) return state
      const purchase = { id: Date.now() + '-' + game.id, ts: Date.now(), title: `🎮 ${game.title}`, cost: game.price, kind: 'arcade' }
      return {
        ...state,
        coins: state.coins - game.price,
        ownedGames: [...state.ownedGames, game.id],
        purchases: [purchase, ...state.purchases],
      }
    }
    case 'SET_PIN':
      return { ...state, pin: action.pin }
    case 'CLEAR_CORRUPT_FLAG':
      return { ...state, corrupt: false }
    case 'RESET_ALL':
      return { ...DEFAULT_STATE, avatar: defaultAvatar() }
    default:
      return state
  }
}

// Items can be renamed/removed in wardrobe.json between releases; make sure
// every equipped id still exists and required slots are never empty.
export function repairAvatar(avatar, items = wardrobe) {
  const byId = new Map(items.map((i) => [i.id, i]))
  const fresh = defaultAvatar(items)
  const owned = [...new Set([...fresh.owned, ...(avatar?.owned ?? []).filter((id) => byId.has(id))])]
  const equipped = {}
  for (const slot of AVATAR_SLOTS) {
    const cur = avatar?.equipped?.[slot]
    const valid = cur && byId.get(cur)?.slot === slot && owned.includes(cur)
    equipped[slot] = valid ? cur : REQUIRED_SLOTS.includes(slot) ? fresh.equipped[slot] : null
  }
  return { owned, equipped }
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || parsed.version !== 1 || typeof parsed.coins !== 'number') {
      return { ...DEFAULT_STATE, corrupt: true }
    }
    const merged = { ...DEFAULT_STATE, ...parsed, corrupt: false }
    merged.avatar = repairAvatar(parsed.avatar)
    if (!merged.ownedGames.includes('catch')) merged.ownedGames = ['catch', ...merged.ownedGames]
    return merged
  } catch {
    return { ...DEFAULT_STATE, corrupt: true }
  }
}

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    try {
      const { corrupt, ...toSave } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // storage full/unavailable — app keeps working in-memory
    }
  }, [state])

  const playedToday = (eventId) => state.dailyPlays[eventId] === businessDate()

  return (
    <PlayerContext.Provider value={{ state, dispatch, playedToday, config }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
