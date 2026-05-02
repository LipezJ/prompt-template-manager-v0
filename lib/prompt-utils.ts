import type { PromptVariable } from "@/types/prompt"

const REF_PATTERN = /(\{{1,2})\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\}{1,2})/g

function isBalanced(open: string, close: string): boolean {
  return open.length === close.length
}

export function extractVariableRefs(text: string): Set<string> {
  const names = new Set<string>()
  for (const match of text.matchAll(REF_PATTERN)) {
    const [, open, name, close] = match
    if (name && isBalanced(open, close)) names.add(name)
  }
  return names
}

export function getMissingRequiredVariables(
  text: string,
  variables: PromptVariable[],
): PromptVariable[] {
  const refs = extractVariableRefs(text)
  return variables.filter(
    (v) => !v.optional && refs.has(v.name) && v.value === "",
  )
}

function renderVariableValue(variable: PromptVariable): string {
  const type = variable.type ?? "string"
  if (type === "select") {
    const match = variable.options?.find((o) => o.value === variable.value)
    return match?.value ?? variable.value
  }
  return variable.value
}

export function replaceVariables(text: string, variables: PromptVariable[]): string {
  if (variables.length === 0) return text
  const byName = new Map(variables.map((v) => [v.name, v]))
  return text.replace(REF_PATTERN, (raw, open: string, name: string, close: string) => {
    if (!isBalanced(open, close)) return raw
    const variable = byName.get(name)
    if (!variable) return raw
    return renderVariableValue(variable)
  })
}
