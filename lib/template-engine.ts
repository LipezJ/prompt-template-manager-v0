import type { PromptVariable } from "@/types/prompt"

export type TemplateNode = TextNode | RefNode | IfNode

interface TextNode {
  kind: "text"
  value: string
}

interface RefNode {
  kind: "ref"
  name: string
  raw: string
}

interface IfNode {
  kind: "if"
  variable: string
  consequent: TemplateNode[]
  alternative: TemplateNode[] | null
}

type Token =
  | { kind: "text"; value: string }
  | { kind: "if-open"; variable: string }
  | { kind: "else" }
  | { kind: "if-close" }
  | { kind: "ref"; name: string; raw: string }

const TOKEN_PATTERN =
  /\{\{\s*(?:(#if)\s+([A-Za-z_][A-Za-z0-9_]*)|(#else)|(\/if))\s*\}\}|(\{{1,2})\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\}{1,2})/g

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let lastIndex = 0
  TOKEN_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_PATTERN.exec(input)) !== null) {
    const raw = match[0]
    const ifOpen = match[1]
    const ifVar = match[2]
    const elseTag = match[3]
    const ifClose = match[4]
    const refOpen = match[5]
    const refName = match[6]
    const refClose = match[7]
    const start = match.index
    if (start > lastIndex) {
      tokens.push({ kind: "text", value: input.slice(lastIndex, start) })
    }
    if (ifOpen) {
      tokens.push({ kind: "if-open", variable: ifVar! })
    } else if (elseTag) {
      tokens.push({ kind: "else" })
    } else if (ifClose) {
      tokens.push({ kind: "if-close" })
    } else if (refOpen && refName && refClose) {
      if (refOpen.length === refClose.length) {
        tokens.push({ kind: "ref", name: refName, raw })
      } else {
        tokens.push({ kind: "text", value: raw })
      }
    }
    lastIndex = start + raw.length
  }
  if (lastIndex < input.length) {
    tokens.push({ kind: "text", value: input.slice(lastIndex) })
  }
  return tokens
}

const PREV_INDENT_RE = /(?:^|\n)([ \t]*)$/
const NEXT_LEAD_RE = /^([ \t]*)\n/

function isControl(token: Token): boolean {
  return token.kind === "if-open" || token.kind === "else" || token.kind === "if-close"
}

function applyWhitespaceControl(tokens: Token[]): Token[] {
  const next = tokens.map((t) => ({ ...t }))
  for (let i = 0; i < next.length; i++) {
    if (!isControl(next[i])) continue
    const prev = i > 0 ? next[i - 1] : null
    const after = i < next.length - 1 ? next[i + 1] : null
    const prevText = prev?.kind === "text" ? prev : null
    const afterText = after?.kind === "text" ? after : null
    const prevAlone = prev === null || (prevText !== null && PREV_INDENT_RE.test(prevText.value))
    const afterAlone = after === null || (afterText !== null && NEXT_LEAD_RE.test(afterText.value))
    if (!prevAlone || !afterAlone) continue
    if (prevText) {
      prevText.value = prevText.value.replace(PREV_INDENT_RE, (m) => (m.startsWith("\n") ? "\n" : ""))
    }
    if (afterText) {
      afterText.value = afterText.value.replace(NEXT_LEAD_RE, "")
    }
  }
  return next
}

function parse(tokens: Token[]): TemplateNode[] {
  let i = 0

  function parseUntil(stopAt: ReadonlyArray<"else" | "if-close">): {
    nodes: TemplateNode[]
    stopper: Token | null
  } {
    const nodes: TemplateNode[] = []
    while (i < tokens.length) {
      const t = tokens[i]
      if (stopAt.includes(t.kind as "else" | "if-close")) {
        return { nodes, stopper: t }
      }
      if (t.kind === "text") {
        if (t.value.length > 0) nodes.push({ kind: "text", value: t.value })
        i++
        continue
      }
      if (t.kind === "ref") {
        nodes.push({ kind: "ref", name: t.name, raw: t.raw })
        i++
        continue
      }
      if (t.kind === "if-open") {
        const variable = t.variable
        i++
        const conseq = parseUntil(["else", "if-close"])
        let alternative: TemplateNode[] | null = null
        if (conseq.stopper?.kind === "else") {
          i++
          const alt = parseUntil(["if-close"])
          if (alt.stopper?.kind !== "if-close") {
            throw new Error("Falta {{/if}}")
          }
          alternative = alt.nodes
          i++
        } else if (conseq.stopper?.kind === "if-close") {
          i++
        } else {
          throw new Error("Falta {{/if}}")
        }
        nodes.push({ kind: "if", variable, consequent: conseq.nodes, alternative })
        continue
      }
      throw new Error(`Tag inesperado: ${t.kind}`)
    }
    return { nodes, stopper: null }
  }

  const result = parseUntil([])
  if (result.stopper) throw new Error(`Tag inesperado: ${result.stopper.kind}`)
  return result.nodes
}

type VariableMap = Map<string, PromptVariable>

function isTruthy(variable: PromptVariable | undefined): boolean {
  if (!variable) return false
  const type = variable.type ?? "string"
  if (type === "boolean") return variable.value === "true"
  return variable.value !== ""
}

function renderVariableValue(variable: PromptVariable): string {
  const type = variable.type ?? "string"
  if (type === "select") {
    const match = variable.options?.find((o) => o.value === variable.value)
    return match?.value ?? variable.value
  }
  return variable.value
}

function renderNodes(nodes: TemplateNode[], variables: VariableMap): string {
  let out = ""
  for (const node of nodes) {
    if (node.kind === "text") {
      out += node.value
    } else if (node.kind === "ref") {
      const v = variables.get(node.name)
      out += v ? renderVariableValue(v) : node.raw
    } else {
      const v = variables.get(node.variable)
      if (isTruthy(v)) out += renderNodes(node.consequent, variables)
      else if (node.alternative) out += renderNodes(node.alternative, variables)
    }
  }
  return out
}

function buildAst(content: string): TemplateNode[] {
  return parse(applyWhitespaceControl(tokenize(content)))
}

export function renderPrompt(content: string, variables: PromptVariable[]): string {
  const map = new Map(variables.map((v) => [v.name, v]))
  try {
    return renderNodes(buildAst(content), map)
  } catch {
    return renderNodes(parse(tokenize(content).filter((t) => !isControl(t))), map)
  }
}

function collectActiveRefs(
  nodes: TemplateNode[],
  variables: VariableMap,
  out: Set<string>,
): void {
  for (const node of nodes) {
    if (node.kind === "ref") {
      out.add(node.name)
    } else if (node.kind === "if") {
      const v = variables.get(node.variable)
      if (isTruthy(v)) collectActiveRefs(node.consequent, variables, out)
      else if (node.alternative) collectActiveRefs(node.alternative, variables, out)
    }
  }
}

export function getActiveVariableRefs(content: string, variables: PromptVariable[]): Set<string> {
  const map = new Map(variables.map((v) => [v.name, v]))
  const out = new Set<string>()
  try {
    collectActiveRefs(buildAst(content), map, out)
  } catch {
    for (const m of content.matchAll(TOKEN_PATTERN)) {
      const refOpen = m[5]
      const refName = m[6]
      const refClose = m[7]
      if (refName && refOpen && refClose && refOpen.length === refClose.length) {
        out.add(refName)
      }
    }
  }
  return out
}
