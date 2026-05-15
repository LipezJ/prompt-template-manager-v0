export type VariableType = "string" | "boolean" | "select"

export interface SelectOption {
  id: string
  label: string
  value: string
}

export interface PromptVariable {
  id: string
  name: string
  value: string
  description?: string
  type?: VariableType
  optional?: boolean
  options?: SelectOption[]
}

export interface Prompt {
  id: string
  content: string
  description?: string
}

export interface PromptSet {
  id: string
  name: string
  variables: PromptVariable[]
  prompts: Prompt[]
  uiPreferences?: {
    splitPosition: number
    variablesPanelVisible: boolean
    cardView: boolean
    variablesTwoColumn?: boolean
  }
}

export interface Project {
  id: string
  name: string
  icon?: string
  pinned?: boolean
  uiPreferences?: {
    promptSetsSidebarVisible: boolean
  }
  promptSets: PromptSet[]
  globalVariables?: PromptVariable[]
}
