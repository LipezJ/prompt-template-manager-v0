import { Fragment, type ReactNode } from "react"

const PATTERN =
  /(\{\{\s*(?:#if\s+[A-Za-z_][A-Za-z0-9_]*|#else|\/if)\s*\}\})|(\{{1,2})\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\}{1,2})/g

export function highlightPromptContent(content: string): ReactNode {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of content.matchAll(PATTERN)) {
    const raw = match[0]
    const control = match[1]
    const refOpen = match[2]
    const refClose = match[4]
    const start = match.index ?? 0

    if (start > lastIndex) {
      nodes.push(<Fragment key={key++}>{content.slice(lastIndex, start)}</Fragment>)
    }

    if (control) {
      nodes.push(
        <span key={key++} className="text-amethyst">
          {raw}
        </span>,
      )
    } else if (refOpen && refClose && refOpen.length === refClose.length) {
      nodes.push(
        <span key={key++} className="text-electric-blue">
          {raw}
        </span>,
      )
    } else {
      nodes.push(<Fragment key={key++}>{raw}</Fragment>)
    }

    lastIndex = start + raw.length
  }

  if (lastIndex < content.length) {
    nodes.push(<Fragment key={key++}>{content.slice(lastIndex)}</Fragment>)
  }

  return nodes
}
