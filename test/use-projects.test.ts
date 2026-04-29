import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { STORAGE_KEYS } from "@/lib/constants"
import { useProjects } from "@/lib/hooks/use-projects"

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("useProjects", () => {
  it("loads the seed when storage is empty and isLoaded flips to true", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.projects.length).toBeGreaterThan(0)
  })

  it("addProject appends a new project with a generated id", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))

    const before = result.current.projects.length
    let created: { id: string } | undefined
    act(() => {
      created = result.current.addProject()
    })
    expect(result.current.projects).toHaveLength(before + 1)
    expect(created!.id).toMatch(/^project-/)
  })

  it("deleteProject removes an entry but refuses to leave the list empty", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))

    // add one so we have two, then delete one to verify removal works
    act(() => {
      result.current.addProject()
    })
    const beforeDelete = result.current.projects.length
    const targetId = result.current.projects[0].id
    act(() => {
      result.current.deleteProject(targetId)
    })
    expect(result.current.projects).toHaveLength(beforeDelete - 1)

    // try to delete the last one — should be a no-op
    const lastId = result.current.projects[0].id
    act(() => {
      result.current.deleteProject(lastId)
    })
    expect(result.current.projects).toHaveLength(1)
  })

  it("updateProject applies a patch function", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))

    const targetId = result.current.projects[0].id
    act(() => {
      result.current.updateProject(targetId, (p) => ({ ...p, name: "Renombrado" }))
    })
    expect(result.current.projects.find((p) => p.id === targetId)?.name).toBe("Renombrado")
  })

  it("reorderProjects swaps positions", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))

    act(() => {
      result.current.addProject()
    })
    const ids = result.current.projects.map((p) => p.id)
    act(() => {
      result.current.reorderProjects(0, 1)
    })
    expect(result.current.projects.map((p) => p.id)).toEqual([ids[1], ids[0]])
  })

  it("persists changes to localStorage after isLoaded", async () => {
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))

    act(() => {
      result.current.addProject()
    })
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEYS.projects)
      expect(raw).not.toBeNull()
    })
    const raw = window.localStorage.getItem(STORAGE_KEYS.projects)
    const parsed = JSON.parse(raw!) as Array<{ id: string }>
    expect(parsed.length).toBe(result.current.projects.length)
  })
})
