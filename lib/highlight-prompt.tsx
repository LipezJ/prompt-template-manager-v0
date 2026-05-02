import { Fragment, type ReactNode } from "react"

const REF_PATTERN = /(\{{1,2})\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\}{1,2})/g

export function highlightPromptContent(content: string): ReactNode {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of content.matchAll(REF_PATTERN)) {
    const [raw, open, , close] = match
    const start = match.index ?? 0
    if (open.length !== close.length) continue
    if (start > lastIndex) {
      nodes.push(<Fragment key={key++}>{content.slice(lastIndex, start)}</Fragment>)
    }
    nodes.push(
      <span key={key++} className="text-electric-blue">
        {raw}
      </span>,
    )
    lastIndex = start + raw.length
  }

  if (lastIndex < content.length) {
    nodes.push(<Fragment key={key++}>{content.slice(lastIndex)}</Fragment>)
  }

  return nodes
}
