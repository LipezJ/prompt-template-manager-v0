import { del as idbDel, get as idbGet, set as idbSet } from "idb-keyval"
import type { ZodError } from "zod"
import type { Project, PromptSet } from "@/types/prompt"
import { STORAGE_KEYS } from "@/lib/constants"
import { createDefaultProjects } from "@/lib/seed"
import { ProjectSchema, ProjectsSchema, PromptSetSchema } from "./schema"

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

const STORE_KEY = STORAGE_KEYS.projects
const BROADCAST_CHANNEL_NAME = "projects-sync"

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null
  if (!channel) channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  return channel
}

function formatError(error: ZodError): string {
  const first = error.issues[0]
  if (!first) return "JSON inválido"
  const path = first.path.length > 0 ? first.path.map(String).join(".") : "(raíz)"
  return `${path}: ${first.message}`
}

export async function loadProjects(): Promise<Project[]> {
  if (typeof window === "undefined") return createDefaultProjects()

  // 1) One-shot migration from legacy localStorage to IndexedDB.
  const lsRaw = window.localStorage.getItem(STORE_KEY)
  if (lsRaw !== null) {
    const migrated = await migrateFromLocalStorage(lsRaw)
    if (migrated) return migrated
  }

  // 2) Normal read from IndexedDB.
  let raw: unknown
  try {
    raw = await idbGet(STORE_KEY)
  } catch (err) {
    console.error(`[projects-repository] failed to read IDB key "${STORE_KEY}"`, err)
    return createDefaultProjects()
  }

  if (raw === undefined) return createDefaultProjects()

  const result = ProjectsSchema.safeParse(raw)
  if (!result.success) {
    console.error(
      `[projects-repository] IDB key "${STORE_KEY}" failed schema validation: ${formatError(result.error)}`,
    )
    await backupCorruptedIDBValue(raw)
    return createDefaultProjects()
  }

  return result.data
}

export async function saveProjects(projects: Project[]): Promise<void> {
  if (typeof window === "undefined") return
  try {
    await idbSet(STORE_KEY, projects)
    getChannel()?.postMessage({ type: "projects-updated" })
  } catch (err) {
    console.error(`[projects-repository] failed to write IDB key "${STORE_KEY}"`, err)
  }
}

export function subscribeToProjectsChanges(handler: () => void): () => void {
  const ch = getChannel()
  if (!ch) return () => {}
  const onMessage = () => handler()
  ch.addEventListener("message", onMessage)
  return () => ch.removeEventListener("message", onMessage)
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

async function migrateFromLocalStorage(lsRaw: string): Promise<Project[] | null> {
  let parsed: unknown
  try {
    parsed = JSON.parse(lsRaw)
  } catch (err) {
    console.error(`[projects-repository] legacy localStorage["${STORE_KEY}"] is not valid JSON`, err)
    backupCorruptedLSValue(lsRaw)
    window.localStorage.removeItem(STORE_KEY)
    return null
  }

  const result = ProjectsSchema.safeParse(parsed)
  if (!result.success) {
    console.error(
      `[projects-repository] legacy localStorage["${STORE_KEY}"] failed validation: ${formatError(result.error)}`,
    )
    backupCorruptedLSValue(lsRaw)
    window.localStorage.removeItem(STORE_KEY)
    return null
  }

  try {
    await idbSet(STORE_KEY, result.data)
    window.localStorage.removeItem(STORE_KEY)
    return result.data
  } catch (err) {
    console.error(`[projects-repository] failed to migrate localStorage to IDB`, err)
    return result.data
  }
}

function backupCorruptedLSValue(raw: string): void {
  try {
    const backupKey = `${STORE_KEY}.corrupt.${Date.now()}`
    window.localStorage.setItem(backupKey, raw)
  } catch (err) {
    console.error("[projects-repository] failed to back up corrupted LS value", err)
  }
}

async function backupCorruptedIDBValue(raw: unknown): Promise<void> {
  try {
    const backupKey = `${STORE_KEY}.corrupt.${Date.now()}`
    await idbSet(backupKey, raw)
    await idbDel(STORE_KEY)
  } catch (err) {
    console.error("[projects-repository] failed to back up corrupted IDB value", err)
  }
}
