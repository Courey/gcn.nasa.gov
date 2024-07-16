/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { findAndReplace } from 'hast-util-find-and-replace'
import { h } from 'hastscript'

const suffixChars = /[a-zA-Z0-9/_=+]/.source
const suffixCharsNonTerminal = /[-.~%:?]/.source
const prefix = /https?:\/\//.source
const terminal = /\s|$/.source
const gcnRegexp = /GCN\s(?:#?\d+|Circular\s\d+)/gi
const urlRegexp = new RegExp(
  `${prefix}(?:${suffixChars}|(?:${suffixCharsNonTerminal})(?!${terminal}))+`,
  'g'
)

function autolinkLiteral(tree: Parameters<typeof findAndReplace>[0]) {
  findAndReplace(
    tree,
    [
      [
        urlRegexp,
        (href) =>
          h('a', { rel: 'external noopener', href, target: '_blank' }, href),
      ],
      [
        gcnRegexp,
        (match) => {
          const id = match.match(/\d+[a-zA-Z]?/)[0]
          const href = `/circulars/${id}`
          return h('a', { href }, match)
        },
      ],
    ],
    { ignore: ['data'] }
  )
  return tree
}

export { autolinkLiteral }
/**
 * Remark plugin to transform strings that look like URLs to hyperlinks.
 * This approximates the "autolink literal" functionality of
 * https://github.com/remarkjs/remark-gfm.
 */
export default function rehypeAutolinkLiteral() {
  return autolinkLiteral
}
