import type { PromptVariable } from "@/types/prompt"
import { getActiveVariableRefs, renderPrompt } from "./template-engine"

const REF_PATTERN = /(\{{1,2})\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\}{1,2})/g

export function extractVariableRefs(text: string): Set<string> {
  const names = new Set<string>()
  for (const match of text.matchAll(REF_PATTERN)) {
    const open = match[1]
    const name = match[2]
    const close = match[3]
    if (name && open.length === close.length) names.add(name)
  }
  return names
}

export function getMissingRequiredVariables(
  text: string,
  variables: PromptVariable[],
): PromptVariable[] {
  const active = getActiveVariableRefs(text, variables)
  return variables.filter((v) => !v.optional && active.has(v.name) && v.value === "")
}

export function replaceVariables(text: string, variables: PromptVariable[]): string {
  return renderPrompt(text, variables)
}
