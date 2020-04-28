import { ExternalTokenizer } from 'lezer'
import {
  anything,
  eof,
  blankLine,
  lineStart,
  lineStartIndented,
  lineStartDedented,

  thematicBreakStart,
  atxHeadingStart,
  AtxHeadingContent,
  // atxHeadingTrail,

  lookahead,
} from './commonmark.terms.js'

class ParseContextCache {
  // copied from https://github.com/lezer-parser/python/blob/master/src/tokens.js
  constructor() {
    this.last = -1
    this.lastIndent = 0
    this.prev = []
    this.line = 0
  }

  markLineNumber(pos) {
    if (pos > this.last) {
      this.line++
    }
  }

  get(pos) {
    if (this.last == pos) return this.lastIndent
    for (let i = 0; i < this.prev.length; i++) {
      if (this.prev[i] == pos) {
        return i
      }
    }
    return -1
  }

  set(pos, indent) {
    if (pos == this.last) return
    if (this.last > -1) {
      this.setPrev(this.last, this.lastIndent)
    }
    this.last = pos
    this.lastIndent = indent
  }

  setPrev(pos, indent) {
    while (this.prev.length < indent) {
      this.prev.push(-1)
    }
    this.prev[indent] = pos
  }

  static for(input) {
    const store = ParseContextCache.caches
    let found = store.get(input)
    if (found == null) {
      store.set(input, found = new ParseContextCache)
    }
    return found
  }
}

ParseContextCache.caches = new WeakMap()

const SPC = ' ' .codePointAt(),
      TAB = '\t'.codePointAt(),
      CR  = '\r'.codePointAt(),
      LF  = '\n'.codePointAt(),
      HASH = '#' .codePointAt()


const _lookahead = new ExternalTokenizer((input, token) => {
  // console.log('Lookahead', token.start)
  // return token.accept(lookahead, token.start)
})

export { _lookahead as lookahead }

/* to accept anything as the last resort */
export const eatAnything = new ExternalTokenizer((input, token) => {
  let pos = token.start
  while (input.get(pos) >= 32) pos++
  if (pos != token.start) {
    return token.accept(anything, pos)
  }
})

export const scanEof = new ExternalTokenizer((input, token) => {
  if (input.get(token.start) < 0) {
    // console.log('!! scanned eof')
    return token.accept(eof, token.start)
  }
}, { contextual: true })

export const scanLineStart = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start
  let indent = 0

  const cache = ParseContextCache.for(input)

  while (1) {
    const c = input.get(pos)

    if (c == SPC) indent++
    else if (c == TAB) indent += 4 - indent % 4
    else if (c < 0) {
      return token.accept(blankLine, pos)
    } else if (c == CR || c == LF) {
      // console.log('blank line', token.start, '->', pos, c)
      // cache.markLineNumber(pos)
      return token.accept(blankLine, pos + 1)
    } else {
      break
    }
    pos++
  }

  cache.markLineNumber(pos)

  // console.log(`Line #${cache.line}, indent=${indent}, last=${cache.lastIndent}`)
  if (indent >= cache.lastIndent + 4) {
    token.accept(lineStartIndented, pos)
    ParseContextCache.for(input).set(pos, indent)
  } else if (indent <= cache.lastIndent - 4) {
    // stack.startOf([lineStartIndented]) >= 0 &&
    token.accept(lineStartDedented, pos)
    ParseContextCache.for(input).set(pos, indent)
  } else {
    token.accept(lineStart, token.start + cache.lastIndent)
  }
})

const thematicBreakChars = new Set(['*', '-', '_'].map(x => x.charCodeAt()))

export const scanThematicBreak = new ExternalTokenizer((input, token, stack) => {
  // console.log('@@ scan thematic break', ParseContextCache.for(input))
  // TODO: check indentation

  let pos = token.start
  let sym = input.get(pos)
  // check the first char
  if (!thematicBreakChars.has(sym)) {
    return
  }

  let cnt = 1
  while (1) {
    const c = input.get(pos++)
    if (c == SPC || c == TAB) {
      continue
    } else if (c == CR || c == LF) {
      // FIXME: lookahead
      pos--
      break
    } else if (c == sym) {
      cnt++
    } else {
      // not a valid thematic break
      return
    }
  }

  if (cnt >= 3) {
    token.accept(thematicBreakStart, token.start)
  }
}, { contextual: true })

function takeWhileLen(input, pos, ch, len) {
  for (let cnt = 0; cnt < len; cnt++, pos++) {
    if (input.get(pos) != ch) {
      return cnt
    }
  }
  return len
}

export const scanAtxHeading = new ExternalTokenizer((input, token, stack) => {
  // TODO: check indentation

  let pos = token.start
  for (let cnt = 0; cnt < 3 && input.get(pos) == SPC; cnt++, pos++);

  if (input.get(pos) != HASH) return

  const level = takeWhileLen(input, pos, HASH, 6)
  pos += level

  if (!level || input.get(pos) == HASH) {
    // 7 # is too much
    return
  }

  if (input.get(pos) != SPC &&
      input.get(pos) != TAB &&
      input.get(pos) != CR &&
      input.get(pos) != LF &&
      input.get(pos) > 0) return

  return token.accept(atxHeadingStart, pos)
})

export const scanAtxHeadingContent = new ExternalTokenizer((input, token, stack) => {
  let scan = token.start

  for (; scan < input.length; scan++) {
    const c = input.get(scan)
    if (c < 0 || c == CR || c == LF) {
      break
    }
  }

  const str = input.read(token.start, scan).split('').reverse().join('')
  const matched = /^\s*(#+\s*)?/.exec(str)

  if (matched && matched.length) {
    return token.accept(AtxHeadingContent, scan - matched[0].length)
  }
})
