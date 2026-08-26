import { describe, it, expect } from 'vitest'
import letters from '../data/questions/letters.json'
import reading from '../data/questions/reading.json'
import counting from '../data/questions/counting.json'
import math from '../data/questions/math.json'
import shapes from '../data/questions/shapes.json'
import compare from '../data/questions/compare.json'
import { EVENTS } from '../data/events.js'

const BANKS = { letters, reading, counting, math, shapes, compare }
const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'
const SHAPE_NAMES = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval', 'diamond', 'pentagon', 'hexagon', 'crescent']

// every char of `small` shows up in `big`, in order
function isSubsequence(small, big) {
  let j = 0
  for (const ch of big) if (ch === small[j]) j++
  return j === small.length
}

// 4 options, unique, containing the answer exactly once
function expectOptions(options, answer, label) {
  expect(options, label).toHaveLength(4)
  expect(new Set(options).size, `${label} options unique`).toBe(4)
  expect(options.filter((o) => o === answer), `${label} answer once`).toHaveLength(1)
}

describe('question banks — shared rules', () => {
  it('every event has a bank with at least 35 items', () => {
    for (const e of EVENTS) {
      expect(BANKS[e.id], e.id).toBeDefined()
      expect(BANKS[e.id].length, e.id).toBeGreaterThanOrEqual(35)
    }
  })

  it('every item has a non-empty speak string', () => {
    for (const [name, bank] of Object.entries(BANKS)) {
      bank.forEach((q, i) => {
        expect(typeof q.speak, `${name}[${i}]`).toBe('string')
        expect(q.speak.trim().length, `${name}[${i}] speak`).toBeGreaterThan(0)
      })
    }
  })

  it('every non-reading item has an answerSpeak string', () => {
    for (const [name, bank] of Object.entries(BANKS)) {
      if (name === 'reading') continue
      bank.forEach((q, i) => {
        expect(typeof q.answerSpeak, `${name}[${i}] answerSpeak`).toBe('string')
        expect(q.answerSpeak.length, `${name}[${i}] answerSpeak`).toBeGreaterThan(0)
      })
    }
  })
})

describe('letters.json', () => {
  it('items are hear/first with a Hebrew letter answer and 4 unique options', () => {
    letters.forEach((q, i) => {
      expect(['hear', 'first'], `letters[${i}] kind`).toContain(q.kind)
      expect(HEBREW_LETTERS.includes(q.letter), `letters[${i}] letter ${q.letter}`).toBe(true)
      expectOptions(q.options, q.letter, `letters[${i}]`)
      for (const o of q.options) expect(HEBREW_LETTERS.includes(o), `letters[${i}] option ${o}`).toBe(true)
      if (q.kind === 'first') {
        expect(q.emoji, `letters[${i}] emoji`).toBeTruthy()
        expect(q.word, `letters[${i}] word`).toBeTruthy()
        expect(q.word[0], `letters[${i}] word starts with letter`).toBe(q.letter)
      } else {
        expect(q.name, `letters[${i}] name`).toBeTruthy()
      }
    })
  })

  it('covers all 22 base letters + 5 final forms in hear mode', () => {
    const heard = new Set(letters.filter((q) => q.kind === 'hear').map((q) => q.letter))
    for (const ch of HEBREW_LETTERS) expect(heard.has(ch), `hear ${ch}`).toBe(true)
  })

  it('picture items use distinct emojis and there are at least 20', () => {
    const firsts = letters.filter((q) => q.kind === 'first')
    expect(firsts.length).toBeGreaterThanOrEqual(20)
    expect(new Set(firsts.map((q) => q.emoji)).size).toBe(firsts.length)
  })
})

describe('reading.json', () => {
  it('has word with nikud, plain form, unique emoji, speak', () => {
    reading.forEach((q, i) => {
      expect(q.word, `reading[${i}]`).toBeTruthy()
      expect(q.plain, `reading[${i}]`).toBeTruthy()
      expect(q.emoji, `reading[${i}]`).toBeTruthy()
      // the pointed word's letters appear in order inside the plain (ktiv male) form,
      // which may add a vav/yod the pointed spelling carries as a vowel mark
      const bare = q.word.replace(/[֑-ׇ]/g, '')
      expect(isSubsequence(bare, q.plain), `reading[${i}] "${bare}" ⊂ "${q.plain}"`).toBe(true)
      expect(q.word.length, `reading[${i}] has nikud`).toBeGreaterThan(bare.length)
    })
    expect(new Set(reading.map((q) => q.emoji)).size).toBe(reading.length)
    expect(new Set(reading.map((q) => q.plain)).size).toBe(reading.length)
  })
})

describe('counting.json', () => {
  it('n in 1..20, mostly within 10, emoji present, answerSpeak matches n', () => {
    counting.forEach((q, i) => {
      expect(Number.isInteger(q.n), `counting[${i}]`).toBe(true)
      expect(q.n, `counting[${i}] n`).toBeGreaterThanOrEqual(1)
      expect(q.n, `counting[${i}] n`).toBeLessThanOrEqual(20)
      expect(q.emoji, `counting[${i}] emoji`).toBeTruthy()
    })
    const small = counting.filter((q) => q.n <= 10).length
    expect(small / counting.length).toBeGreaterThan(0.6)
  })
})

describe('math.json', () => {
  it('answers are arithmetically correct, within 0..20, dots match the exercise', () => {
    math.forEach((q, i) => {
      const m = q.q.match(/^(\d+) ([+−]) (\d+)$/)
      expect(m, `math[${i}] "${q.q}" format`).not.toBeNull()
      const a = Number(m[1]); const b = Number(m[3])
      const expected = m[2] === '+' ? a + b : a - b
      expect(Number(q.a), `math[${i}] ${q.q}`).toBe(expected)
      expect(expected, `math[${i}] range`).toBeGreaterThanOrEqual(0)
      expect(expected, `math[${i}] range`).toBeLessThanOrEqual(20)
      expect(q.dots, `math[${i}] dots`).toEqual([a, m[2] === '+' ? b : -b])
    })
  })

  it('starts with exercises within 10 (sums first), with at least 6 unique answers for pairs', () => {
    const first = math.slice(0, 35)
    for (const q of first) {
      const [a, , b] = q.q.split(' ')
      expect(Math.max(Number(a), Number(b), Number(q.a))).toBeLessThanOrEqual(10)
    }
    expect(new Set(math.map((q) => q.a)).size).toBeGreaterThanOrEqual(6)
  })
})

describe('shapes.json', () => {
  it('shape items use known shapes; pattern items have seq/answer/options', () => {
    shapes.forEach((q, i) => {
      expect(['shape', 'pattern'], `shapes[${i}] kind`).toContain(q.kind)
      if (q.kind === 'shape') {
        expect(SHAPE_NAMES, `shapes[${i}] ask`).toContain(q.ask)
        expectOptions(q.options, q.ask, `shapes[${i}]`)
        for (const o of q.options) expect(SHAPE_NAMES, `shapes[${i}] option ${o}`).toContain(o)
      } else {
        expect(Array.isArray(q.seq) && q.seq.length >= 4, `shapes[${i}] seq`).toBe(true)
        expectOptions(q.options, q.answer, `shapes[${i}]`)
      }
    })
  })

  it('every supported shape is asked at least once', () => {
    const asked = new Set(shapes.filter((q) => q.kind === 'shape').map((q) => q.ask))
    for (const s of SHAPE_NAMES) expect(asked.has(s), s).toBe(true)
  })
})

describe('compare.json', () => {
  it('count items: n <= 10, never a tie, ask more|less, spoken side matches', () => {
    compare.filter((q) => q.kind === 'count').forEach((q, i) => {
      expect(['more', 'less'], `compare count[${i}] ask`).toContain(q.ask)
      for (const side of ['left', 'right']) {
        expect(q[side].emoji, `compare count[${i}] ${side}`).toBeTruthy()
        expect(q[side].n).toBeGreaterThanOrEqual(1)
        expect(q[side].n).toBeLessThanOrEqual(10)
      }
      expect(q.left.n, `compare count[${i}] tie`).not.toBe(q.right.n)
      const leftWins = (q.ask === 'more') === (q.left.n > q.right.n)
      expect(q.answerSpeak).toBe(leftWins ? 'בצד שמאל' : 'בצד ימין')
    })
  })

  it('number items: distinct numbers <= 20, ask bigger|smaller', () => {
    compare.filter((q) => q.kind === 'number').forEach((q, i) => {
      expect(['bigger', 'smaller'], `compare number[${i}] ask`).toContain(q.ask)
      expect(q.a).not.toBe(q.b)
      for (const v of [q.a, q.b]) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(20)
      }
    })
  })

  it('has both kinds', () => {
    expect(compare.some((q) => q.kind === 'count')).toBe(true)
    expect(compare.some((q) => q.kind === 'number')).toBe(true)
  })
})
