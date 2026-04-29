import type { PromptVariable } from "@/types/prompt"

export function replaceVariables(text: string, variables: PromptVariable[]): string {
  return variables.reduce((result, variable) => {
    const safeName = variable.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return result.replace(new RegExp(`\\{${safeName}\\}`, "g"), variable.value)
  }, text)
}
