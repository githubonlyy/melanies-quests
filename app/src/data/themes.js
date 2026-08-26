// The three worlds Melanie picks from on every launch. Everything visual that
// is not subject-specific reads from here: shell colors (as CSS vars), confetti,
// floating particles, and the arcade sprite skins.
//
// CSS vars are applied inline on the app root by ThemeContext and consumed with
// Tailwind v4 arbitrary-var classes, e.g. `bg-(--t-side)`.

export const THEME_VAR_KEYS = [
  '--t-bg-from', // main area gradient start
  '--t-bg-to', // main area gradient end
  '--t-side', // sidebar / bottom-nav background
  '--t-side-deep', // sidebar borders, darkest shade
  '--t-nav', // inactive nav button background
  '--t-panel', // translucent panel background over the main gradient
  '--t-panel-border', // panel border
  '--t-accent', // theme highlight (title span, active indicators)
  '--t-accent-deep', // pressed / border shade of accent
  '--t-text-soft', // muted text on side/panel surfaces
  '--t-overlay', // modal / match backdrop
]

export const THEMES = {
  barbie: {
    id: 'barbie',
    label: 'ברבי',
    subtitle: 'עולם ורוד ונוצץ',
    emoji: '💖',
    vars: {
      '--t-bg-from': '#ff6cc1',
      '--t-bg-to': '#d61a86',
      '--t-side': '#b3126d',
      '--t-side-deep': '#7a0a49',
      '--t-nav': '#c8177b',
      '--t-panel': 'rgba(122, 10, 73, 0.45)',
      '--t-panel-border': '#8f0d56',
      '--t-accent': '#ffd6ef',
      '--t-accent-deep': '#ff7fcf',
      '--t-text-soft': '#ffc2e6',
      '--t-overlay': 'rgba(90, 6, 54, 0.94)',
    },
    confetti: ['#ff4fb3', '#ffd6ef', '#facc15', '#ffffff', '#ff8ad4', '#c026d3'],
    particles: ['💖', '✨', '👠', '💄', '🎀'],
    arcade: {
      catch: { good: '💎', bad: '🕷️', title: 'ציד יהלומים', he: 'תפסו יהלומים, תתחמקו מעכבישים!' },
      flappy: { hero: '🦋', wall: '#ff4fb3', title: 'פרפר בטיסה', he: 'הקישו כדי לעוף בין העמודים!' },
      breaker: { title: 'שוברים בועות', he: 'פוצצו את כל הבועות עם הכדור!', bricks: ['#ff4fb3', '#ff8ad4', '#ffd6ef', '#f472b6', '#e879f9'] },
      whack: { good: '🐩', bad: '🕷️', title: 'תפסו את הכלבלב', he: 'תפסו את הכלבלבים — לא את העכבישים!' },
    },
    avatarPreset: { hair: 'hair-long-blonde', dress: 'dress-pink-gown', head: 'head-tiara' },
  },
  unicorn: {
    id: 'unicorn',
    label: 'חד-קרן',
    subtitle: 'עולם קסום בצבעי הקשת',
    emoji: '🦄',
    vars: {
      '--t-bg-from': '#a78bfa',
      '--t-bg-to': '#3b82f6',
      '--t-side': '#5b21b6',
      '--t-side-deep': '#3b0f7a',
      '--t-nav': '#6d28d9',
      '--t-side-deep-alt': '#4c1d95',
      '--t-panel': 'rgba(59, 15, 122, 0.45)',
      '--t-panel-border': '#4c1d95',
      '--t-accent': '#e9d5ff',
      '--t-accent-deep': '#c084fc',
      '--t-text-soft': '#ddd6fe',
      '--t-overlay': 'rgba(35, 8, 80, 0.94)',
    },
    confetti: ['#c084fc', '#60a5fa', '#34d399', '#fde047', '#fb7185', '#ffffff'],
    particles: ['🦄', '🌈', '⭐', '✨', '☁️'],
    arcade: {
      catch: { good: '⭐', bad: '🌩️', title: 'תפיסת כוכבים', he: 'תפסו כוכבים, תתחמקו מסופות!' },
      flappy: { hero: '🦄', wall: '#7c3aed', title: 'חד-קרן מעופף', he: 'הקישו כדי לעוף בין העננים!' },
      breaker: { title: 'קשת בענן', he: 'שברו את כל צבעי הקשת!', bricks: ['#f87171', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#a78bfa'] },
      whack: { good: '🦄', bad: '🌩️', title: 'תפסו את החד-קרן', he: 'תפסו חדי-קרן — לא סופות!' },
    },
    avatarPreset: { hair: 'hair-rainbow', dress: 'dress-rainbow', head: 'head-horn', back: 'back-wings' },
  },
  flowers: {
    id: 'flowers',
    label: 'פרחים',
    subtitle: 'גינה פורחת ושמש',
    emoji: '🌸',
    vars: {
      '--t-bg-from': '#86efac',
      '--t-bg-to': '#15803d',
      '--t-side': '#166534',
      '--t-side-deep': '#14532d',
      '--t-nav': '#15803d',
      '--t-panel': 'rgba(20, 83, 45, 0.45)',
      '--t-panel-border': '#166534',
      '--t-accent': '#fef08a',
      '--t-accent-deep': '#facc15',
      '--t-text-soft': '#bbf7d0',
      '--t-overlay': 'rgba(10, 50, 25, 0.94)',
    },
    confetti: ['#f9a8d4', '#fde047', '#fb923c', '#86efac', '#ffffff', '#f43f5e'],
    particles: ['🌸', '🌼', '🌷', '🍃', '🐞'],
    arcade: {
      catch: { good: '🌸', bad: '🐝', title: 'קטיף פרחים', he: 'תפסו פרחים, תתחמקו מדבורים!' },
      flappy: { hero: '🐞', wall: '#15803d', title: 'חיפושית עפה', he: 'הקישו כדי לעוף בין הגבעולים!' },
      breaker: { title: 'פריחה', he: 'פתחו את כל הפרחים עם הכדור!', bricks: ['#f9a8d4', '#fde047', '#fb923c', '#f43f5e', '#c084fc'] },
      whack: { good: '🐰', bad: '🐝', title: 'תפסו את הארנב', he: 'תפסו ארנבים — לא דבורים!' },
    },
    avatarPreset: { hair: 'hair-braids', dress: 'dress-floral', head: 'head-flower-crown' },
  },
}

export const THEME_IDS = Object.keys(THEMES)
export const DEFAULT_THEME = 'barbie'
