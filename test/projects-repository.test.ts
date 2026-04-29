import { get as idbGet, set as idbSet } from "idb-keyval"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { STORAGE_KEYS } from "@/lib/constants"
import { createDefaultProjects } from "@/lib/seed"
import {
  loadProjects,
  parseImportedProject,
  parseImportedPromptSet,
  saveProjects,
} from "@/lib/storage/projects-repository"
import type { Project, PromptSet } from "@/types/prompt"

const VALID_SET: PromptSet = {
  id: "set1",
  name: "smoke",
  variables: [{ id: "v1", name: "x", value: "hi" }],
  prompts: [{ id: "p1", content: "{x}!" }],
}

const VALID_PROJECT: Project = {
  id: "default",
  name: "Mi Proyecto",
  promptSets: [VALID_SET],
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("loadProjects (IndexedDB)", () => {
  it("returns the default seed when storage is empty", async () => {
    expect(await loadProjects()).toEqual(createDefaultProjects())
  })

  it("returns the parsed array when IDB holds valid data", async () => {
    await idbSet(STORAGE_KEYS.projects, [VALID_PROJECT])
    expect(await loadProjects()).toEqual([VALID_PROJECT])
  })

  it("falls back to seed when IDB holds an invalid shape", async () => {
    await idbSet(STORAGE_KEYS.projects, { not: "an array" })
    expect(await loadProjects()).toEqual(createDefaultProjects())
  })

  it("falls back to seed when a project is missing the prompts field", async () => {
    await idbSet(STORAGE_KEYS.projects, [
      { id: "x", name: "y", promptSets: [{ id: "s", name: "n", variables: [] }] },
    ])
    expect(await loadProjects()).toEqual(createDefaultProjects())
  })
})

describe("loadProjects (legacy localStorage migration)", () => {
  it("migrates valid localStorage data into IDB and clears the legacy key", async () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify([VALID_PROJECT]))

    const loaded = await loadProjects()
    expect(loaded).toEqual([VALID_PROJECT])

    expect(window.localStorage.getItem(STORAGE_KEYS.projects)).toBeNull()
    expect(await idbGet(STORAGE_KEYS.projects)).toEqual([VALID_PROJECT])
  })

  it("backs up corrupted JSON in localStorage and falls back to seed", async () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, "{not json")

    const loaded = await loadProjects()
    expect(loaded).toEqual(createDefaultProjects())

    const backup = Object.keys(window.localStorage).find((k) => k.startsWith("projects.corrupt."))
    expect(backup).toBeTruthy()
    expect(window.localStorage.getItem(backup!)).toBe("{not json")
    expect(window.localStorage.getItem(STORAGE_KEYS.projects)).toBeNull()
  })

  it("backs up invalid-shape localStorage and falls back to seed", async () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify({ not: "an array" }))

    const loaded = await loadProjects()
    expect(loaded).toEqual(createDefaultProjects())

    const backup = Object.keys(window.localStorage).find((k) => k.startsWith("projects.corrupt."))
    expect(backup).toBeTruthy()
  })
})

describe("saveProjects", () => {
  it("round-trips through IDB", async () => {
    await saveProjects([VALID_PROJECT])
    expect(await idbGet(STORAGE_KEYS.projects)).toEqual([VALID_PROJECT])
  })
})

describe("parseImportedProject", () => {
  it("returns ok for a valid project JSON", () => {
    expect(parseImportedProject(JSON.stringify(VALID_PROJECT))).toEqual({ ok: true, value: VALID_PROJECT })
  })

  it("returns ok:false for invalid JSON", () => {
    const result = parseImportedProject("{garbage")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/JSON/i)
  })

  it("returns ok:false with a path for an invalid shape", () => {
    const result = parseImportedProject(JSON.stringify({ id: "x" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/name|promptSets/i)
  })
})

describe("parseImportedPromptSet", () => {
  it("returns ok for a valid prompt set JSON", () => {
    expect(parseImportedPromptSet(JSON.stringify(VALID_SET))).toEqual({ ok: true, value: VALID_SET })
  })

  it("returns ok:false for invalid JSON", () => {
    expect(parseImportedPromptSet("nope").ok).toBe(false)
  })

  it("returns ok:false when the prompt set is missing prompts", () => {
    const result = parseImportedPromptSet(JSON.stringify({ id: "s", name: "n", variables: [] }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/prompts/i)
  })
})
