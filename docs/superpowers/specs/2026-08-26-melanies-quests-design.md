# Melanie's Quests — Design Spec

**Date:** 2026-08-26
**Status:** Approved (Lior: new repo, 3 pick-each-time themes, coins buy avatar clothes, girl-friendly arcade)
**Derived from:** Tommy's Quests (`C:\Users\liorg\AI\Tommy_Academia`, github.com/githubonlyy/tommys-quests)

## Summary

Tablet-first web app gamifying first-grade (כיתה א') homework for Melanie (7, pre-reader at start of year). Same engine as Tommy's Quests — quiz matches, coins, XP, streaks, daily chest, trophies, parent PIN dashboard, arcade — with three changes that matter:

1. **Content is first-grade and spoken aloud.** Letters, first words, counting, +/− to 10/20, shapes/patterns, more/less. Every prompt is read by Hebrew TTS. No timers.
2. **Theme is hers, every time.** On each launch she picks one of three worlds: ברבי 💖, חד-קרן 🦄, פרחים 🌸. The whole UI, confetti, and arcade sprites follow the pick.
3. **Coins buy avatar clothes.** A dress-up avatar (SVG doll) lives in the header; the Closet sells outfits, hair, crowns, wings, pets per theme. The real-world rewards shop stays as a second, parent-edited tab.

## Locked Decisions

| Topic | Decision |
|---|---|
| Repo | New: `githubonlyy/melanies-quests`, public, GitHub Pages via Actions on push to `master` (same pipeline as Tommy). Local: `C:\Users\liorg\AI\Melanie_Academia` |
| Language | Hebrew-only UI, root `dir="rtl"`, sidebar on the right. English only for a few game words (XP, LVL). She can't read yet — icons + TTS carry meaning |
| Stack | Unchanged: Vite + React 19 + Tailwind v4 + lucide-react, localStorage key `melanies-quests-v1`, Vitest, oxlint |
| Match format | 8 questions/match. **No per-question timer** (`questionTimerSec: 0` disables the bar, no speed bonus). Win ≥6, Draw 4–5, Loss <4 |
| Economy | 10 coins/correct, +50 win bonus, daily chest 100 after `dailyGoal: 3` subjects. Replays = XP only ("אימון") |
| Lessons | Dropped (text stories a pre-reader can't use). Card tap → preview modal → play |
| Themes | 3, picked on every page load (full-screen picker), switchable from header. Last pick remembered as default highlight |
| Avatar | SVG doll with slots: skin, hair, dress, shoes, head, hand, back, pet. Items tagged per theme or `all`. Bought once, equipped freely |
| Arcade | Same 4 mechanics (catch, flappy, breaker, whack), reskinned per theme: sprites/colors/names come from the active theme. Still gated behind the daily goal |

## Architecture

```
app/src/
  App.jsx                       // RTL shell, theme picker gate, header with avatar
  context/PlayerContext.jsx     // + avatar {owned, equipped}, WARDROBE_BUY / AVATAR_EQUIP
  context/ThemeContext.jsx      // active theme, setTheme, CSS vars on root
  data/
    config.json                 // retuned (8 q, no timer, goal 3)
    themes.js                   // THEMES: colors, particles, arcade skins, labels
    events.js                   // 6 first-grade subjects
    questions/{letters,reading,counting,math,shapes,compare}.json
    wardrobe.json               // avatar items
    shop.json                   // real-world rewards (parent-edited)
    trophies.js                 // retargeted to new subjects + wardrobe
    arcadeGames.js              // 4 games, per-theme skin map
  match/
    speak.js                    // Hebrew TTS (SpeechSynthesis, he-IL)
    MatchEngine.jsx             // timer optional, speaks prompt, new banks/widgets
    widgets/
      BigTiles.jsx              // 4 large tiles: letters, pictures, shapes, patterns
      TwoChoice.jsx             // "which has more?" two-panel pick
      CountObjects.jsx          // emoji cluster + NumberPad 0–20
      NumberPad.jsx             // kept, capped digits
      BalloonPop.jsx, PairsBoard.jsx  // kept, theme colors
  avatar/
    Avatar.jsx                  // layered SVG doll from equipped items
    parts/*.jsx                 // slot renderers
  screens/
    ThemePicker.jsx, EventBoard.jsx, Closet.jsx, Shop.jsx, Arcade.jsx, Trophies.jsx, CoachStats.jsx
  arcade/                       // 4 games, read theme for sprites
```

## Subjects (events)

| id | Title | Widget | Modes | Bank shape |
|---|---|---|---|---|
| `letters` | אותיות | BigTiles | classic, balloon | `{ prompt: "איפה האות בּ?", speak, options:[4 letters], answer }` plus "באיזו אות מתחילה 🍎?" items |
| `reading` | קריאה | BigTiles (emoji options) | classic, pairs | `{ word: "אַבָּא", emoji: "👨", speak }` — engine builds 4-picture pick or word↔picture pairs |
| `counting` | ספירה | CountObjects | classic, balloon | `{ emoji, n }` n ∈ 1..20 |
| `math` | חשבון | NumberPad (+dots) | classic, balloon, pairs | `{ q: "3 + 4", a: "7", dots: true }` sums ≤10 first, ≤20 later in file order |
| `shapes` | צורות ודפוסים | BigTiles (SVG shapes / emoji patterns) | classic | shape pick `{ ask: "triangle" }` and pattern `{ seq:["🔴","🔵","🔴","🔵"], options, answer }` |
| `compare` | גדול וקטן | TwoChoice | classic | `{ left:{emoji,n}, right:{emoji,n}, ask:"more"|"less" }` or numeric `{ a:7, b:4, ask }` |

Every question carries a `speak` string (or the engine derives one). MatchEngine calls `speak()` when a question mounts and on the 🔊 button. Feedback lines are spoken too ("מעולה!", "לא נורא, התשובה היא…").

## Themes

`themes.js` exports `THEMES = { barbie, unicorn, flowers }`, each:

```js
{
  id, label: 'ברבי', emoji: '💖',
  vars: { '--t-bg-from', '--t-bg-to', '--t-side', '--t-side-deep', '--t-panel', '--t-accent', '--t-accent-deep', '--t-coin', '--t-text' },
  confetti: [hex...], particles: ['💖','✨','👠'],
  arcade: { catch: {good:'💎', bad:'🕷️', title:'ציד יהלומים'}, flappy: {hero:'👛', wall:'🌴', title:'…'}, breaker: {...}, whack: {...} },
  avatarPreset: { hair:'…', dress:'…' }   // default free outfit for that world
}
```

`ThemeContext` applies `vars` as inline CSS custom properties on the root div and stores `data-theme`. Tailwind v4 arbitrary-var classes (`bg-(--t-side)`) consume them. The picker (`ThemePicker.jsx`) is a full-screen gate rendered until `theme` is set for this session; header button reopens it.

## Avatar & Closet

- `Avatar.jsx` renders an SVG (viewBox 200×320) composing slot parts from `wardrobe.json` entries. Each item: `{ id, slot, name, theme, price, rarity, variant, colors }`. Slots: `skin` (free, 3 tones), `hair` (style×color), `dress`, `shoes`, `head` (crown/bow/horn/flower crown), `hand` (wand/purse/bouquet), `back` (wings/cape), `pet` (companion emoji).
- Default state owns one free item per required slot; theme picks preset equips if owned.
- `Closet.jsx`: large avatar preview, slot tabs (icons), item grid filtered to current theme + `all`, owned → tap to equip, unowned → buy modal (same double-tap guard as Shop). Equipped item highlighted.
- Reducer: `WARDROBE_BUY {item}` (funds check, logs purchase `👗 name`), `AVATAR_EQUIP {slot, itemId}` (must be owned; `null` allowed for optional slots).
- Header avatar: 56 px mini `Avatar` in place of Tommy's star placeholder; tapping opens Closet.

## Arcade

Games keep their loops. Each reads `useTheme()` for `theme.arcade[gameKey]` sprites and titles. Bombs/hazards become theme-appropriate (thorn, rain cloud, bee). `arcadeGames.js` keeps prices: catch free, flappy 1500, breaker 2000, whack 2500.

## Parent (Coach)

Unchanged: PIN 1234 default, lockout, win rate, per-subject breakdown, battle log, purchases (now includes wardrobe buys). Labels Hebrew.

## Edge Cases

- No Hebrew voice on device → `speak()` no-ops silently; 🔊 button still visible (prompt text shown regardless).
- Theme not picked (refresh mid-session) → picker again; matches never survive refresh (existing anti-cheat).
- Equipped item missing from wardrobe.json (renamed) → slot falls back to first free item.
- Corrupt localStorage → defaults + toast (existing).

## Testing

Vitest: existing reducer/economy/streak/chest/arcade tests retargeted; new tests for `WARDROBE_BUY`/`AVATAR_EQUIP`, no-timer scoring, theme registry completeness (every theme has all vars + 4 arcade skins), bank validation (every item has a speak string, options include the answer exactly once, wardrobe has a free item per required slot).

## Out of Scope

Cloud sync, multi-kid profiles (Michael inherits by copying next year), real photo avatars, English.
