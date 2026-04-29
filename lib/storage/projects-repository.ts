import type { ZodError } from "zod"
import type { Project, PromptSet } from "@/types/prompt"
import { STORAGE_KEYS } from "@/lib/constants"
import { createDefaultProjects } from "@/lib/seed"
import { ProjectSchema, ProjectsSchema, PromptSetSchema } from "./schema"

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

function formatError(error: ZodError): string {
  const first = error.issues[0]
  if (!first) return "JSON inválido"
  const path = first.path.length > 0 ? first.path.map(String).join(".") : "(raíz)"
  return `${path}: ${first.message}`
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return createDefaultProjects()

  const raw = window.localStorage.getItem(STORAGE_KEYS.projects)
  if (raw === null) return createDefaultProjects()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(`[projects-repository] localStorage["${STORAGE_KEYS.projects}"] is not valid JSON`, err)
    backupCorruptedValue(raw)
    return createDefaultProjects()
  }

  const result = ProjectsSchema.safeParse(parsed)
  if (!result.success) {
    console.error(
      `[projects-repository] localStorage["${STORAGE_KEYS.projects}"] failed schema validation: ${formatError(result.error)}`,
    )
    backupCorruptedValue(raw)
    return createDefaultProjects()
  }

  return result.data
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects))
  } catch (err) {
    console.error(`[projects-repository] failed to write localStorage["${STORAGE_KEYS.projects}"]`, err)
  }
}

export function parseImportedProject(raw: string): ParseResult<Project> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: "El texto no es JSON válido" }
  }
  const result = ProjectSchema.safeParse(parsed)
  if (!result.success) return { ok: false, error: formatError(result.error) }
  return { ok: true, value: result.data }
}

export function parseImportedPromptSet(raw: string): ParseResult<PromptSet> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: "El texto no es JSON válido" }
  }
  const result = PromptSetSchema.safeParse(parsed)
  if (!result.success) return { ok: false, error: formatError(result.error) }
  return { ok: true, value: result.data }
}

function backupCorruptedValue(raw: string): void {
  try {
    const backupKey = `${STORAGE_KEYS.projects}.corrupt.${Date.now()}`
    window.localStorage.setItem(backupKey, raw)
  } catch (err) {
    console.error("[projects-repository] failed to back up corrupted value", err)
  }
}
