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

describe("loadProjects", () => {
  it("returns the default seed when storage is empty", () => {
    const result = loadProjects()
    expect(result).toEqual(createDefaultProjects())
  })

  it("returns the parsed array when storage holds valid data", () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify([VALID_PROJECT]))
    expect(loadProjects()).toEqual([VALID_PROJECT])
  })

  it("falls back to seed and backs up when storage holds invalid JSON", () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, "{not json")
    const result = loadProjects()
    expect(result).toEqual(createDefaultProjects())
    const backup = Object.keys(window.localStorage).find((k) => k.startsWith("projects.corrupt."))
    expect(backup).toBeTruthy()
    expect(window.localStorage.getItem(backup!)).toBe("{not json")
  })

  it("falls back to seed and backs up when storage holds an invalid shape", () => {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify({ not: "an array" }))
    const result = loadProjects()
    expect(result).toEqual(createDefaultProjects())
    const backup = Object.keys(window.localStorage).find((k) => k.startsWith("projects.corrupt."))
    expect(backup).toBeTruthy()
  })

  it("falls back to seed when a project is missing the prompts field", () => {
    const broken = [{ id: "x", name: "y", promptSets: [{ id: "s", name: "n", variables: [] }] }]
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(broken))
    expect(loadProjects()).toEqual(createDefaultProjects())
  })
})

describe("saveProjects", () => {
  it("round-trips through localStorage", () => {
    saveProjects([VALID_PROJECT])
    const raw = window.localStorage.getItem(STORAGE_KEYS.projects)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual([VALID_PROJECT])
  })
})

describe("parseImportedProject", () => {
  it("returns ok for a valid project JSON", () => {
    const result = parseImportedProject(JSON.stringify(VALID_PROJECT))
    expect(result).toEqual({ ok: true, value: VALID_PROJECT })
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
    const result = parseImportedPromptSet(JSON.stringify(VALID_SET))
    expect(result).toEqual({ ok: true, value: VALID_SET })
  })

  it("returns ok:false for invalid JSON", () => {
    const result = parseImportedPromptSet("nope")
    expect(result.ok).toBe(false)
  })

  it("returns ok:false when the prompt set is missing prompts", () => {
    const result = parseImportedPromptSet(JSON.stringify({ id: "s", name: "n", variables: [] }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/prompts/i)
  })
})
