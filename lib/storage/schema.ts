import { z } from "zod"
import type { Project, PromptSet } from "@/types/prompt"

export const PromptVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().optional(),
})

export const PromptSchema = z.object({
  id: z.string(),
  content: z.string(),
  description: z.string().optional(),
})

export const UiPreferencesSchema = z.object({
  splitPosition: z.number().default(50),
  variablesPanelVisible: z.boolean().default(true),
  cardView: z.boolean().default(false),
})

export const PromptSetSchema = z.object({
  id: z.string(),
  name: z.string(),
  variables: z.array(PromptVariableSchema),
  prompts: z.array(PromptSchema),
  uiPreferences: UiPreferencesSchema.optional(),
})

export const ProjectUiPreferencesSchema = z.object({
  promptSetsSidebarVisible: z.boolean().default(false),
})

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  pinned: z.boolean().optional(),
  uiPreferences: ProjectUiPreferencesSchema.optional(),
  promptSets: z.array(PromptSetSchema),
})

export const ProjectsSchema = z.array(ProjectSchema)

// Compile-time guard: keep types/prompt.ts and the schemas in sync.
// If the shapes diverge, one of these aliases becomes `never` and tsc fails.
type _ProjectMatchesSchema = Project extends z.infer<typeof ProjectSchema>
  ? z.infer<typeof ProjectSchema> extends Project
    ? true
    : never
  : never
type _PromptSetMatchesSchema = PromptSet extends z.infer<typeof PromptSetSchema>
  ? z.infer<typeof PromptSetSchema> extends PromptSet
    ? true
    : never
  : never
const _projectGuard: _ProjectMatchesSchema = true
const _promptSetGuard: _PromptSetMatchesSchema = true
void _projectGuard
void _promptSetGuard
