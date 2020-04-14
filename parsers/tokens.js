import { ExternalTokenizer } from 'lezer'
import { anything, nonIndentSpaces, blockIndent, blankLine, eof, thematicBreakInner } from './commonmark.terms.js'

const SPC = ' ' .codePointAt(),
      TAB = '\t'.codePointAt(),
      CR  = '\r'.codePointAt(),
      LF  = '\n'.codePointAt()

/* to accept anything as the last resort */
export const eatAnything = new ExternalTokenizer((input, token) => {
  let pos = token.start
  while (input.get(pos) >= 32) pos++
  if (pos != token.start) {
    return token.accept(anything, pos);
  }
})

export const scanLineStart = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start
  let cnt = 0
  if (input.get(pos) < 0) {
    return token.accept(eof, pos)
  }
  while (1) {
    const c = input.get(pos++)
    if (c == SPC) cnt++
    else if (c == TAB) cnt += 4
    else {
      if (c == CR || c == LF) {
        // FIXME
        token.accept(blankLine, pos)
      } else if (c >= 32) {  // non-blank char, huh?
        pos--
        if (cnt >= 4) {
          token.accept(blockIndent, token.start + 4)
        } else if (cnt > 0) {
          token.accept(nonIndentSpaces, pos)
        }
      }
      return
    }
  }
})

const thematicBreakChars = new Set(['*', '-', '_'].map(x => x.charCodeAt()))

export const scanThematicBreak = new ExternalTokenizer((input, token, stack) => {
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
    token.accept(thematicBreakInner, pos)
  }
})
