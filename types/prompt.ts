export interface PromptVariable {
  id: string
  name: string
  value: string
}

export interface Prompt {
  id: string
  content: string
}

export interface PromptSet {
  id: string
  name: string
  variables: PromptVariable[]
  prompts: Prompt[]
}

export interface Project {
  id: string
  name: string
  promptSets: PromptSet[]
}
