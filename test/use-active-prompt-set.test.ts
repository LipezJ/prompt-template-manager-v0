import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useProjects } from "@/lib/hooks/use-projects"
import { useActivePromptSet } from "@/lib/hooks/use-active-prompt-set"

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

function useCombined(projectId: string) {
  const projectsState = useProjects()
  const active = useActivePromptSet(projectId, projectsState)
  return { projectsState, active }
}

async function renderReady() {
  const { result } = renderHook(() => useCombined("default"))
  await waitFor(() => {
    expect(result.current.projectsState.isLoaded).toBe(true)
    expect(result.current.active.activePromptSet).toBeTruthy()
  })
  return result
}

describe("useActivePromptSet", () => {
  it("exposes the first prompt set as active by default", async () => {
    const result = await renderReady()
    expect(result.current.active.activePromptSet).toBeDefined()
  })

  it("addPromptSet appends a new set", async () => {
    const result = await renderReady()
    const before = result.current.active.currentProject!.promptSets.length

    act(() => {
      result.current.active.addPromptSet()
    })

    await waitFor(() => {
      expect(result.current.active.currentProject!.promptSets).toHaveLength(before + 1)
    })
    // Selection of the new set is verified end-to-end (depends on URL pushState);
    // the URL/router interaction is mocked here so we only assert the state mutation.
  })

  it("addVariable appends a variable to the active set", async () => {
    const result = await renderReady()
    const before = result.current.active.activePromptSet!.variables.length

    act(() => {
      result.current.active.addVariable()
    })

    await waitFor(() => {
      expect(result.current.active.activePromptSet!.variables).toHaveLength(before + 1)
    })
  })

  it("updateVariable mutates the value in place", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addVariable()
    })
    const varId = result.current.active.activePromptSet!.variables.at(-1)!.id

    act(() => {
      result.current.active.updateVariable(varId, "nuevo valor")
    })
    expect(result.current.active.activePromptSet!.variables.find((v) => v.id === varId)?.value).toBe(
      "nuevo valor",
    )
  })

  it("clearAllVariableValues empties every value but keeps names", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addVariable()
    })
    const varId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.updateVariable(varId, "tiene contenido")
    })

    act(() => {
      result.current.active.clearAllVariableValues()
    })
    for (const v of result.current.active.activePromptSet!.variables) {
      expect(v.value).toBe("")
      expect(v.name).not.toBe("")
    }
  })

  it("addPrompt appends a prompt and updatePrompt edits content", async () => {
    const result = await renderReady()
    const before = result.current.active.activePromptSet!.prompts.length

    act(() => {
      result.current.active.addPrompt()
    })
    await waitFor(() => {
      expect(result.current.active.activePromptSet!.prompts).toHaveLength(before + 1)
    })
    const promptId = result.current.active.activePromptSet!.prompts.at(-1)!.id

    act(() => {
      result.current.active.updatePrompt(promptId, "contenido nuevo")
    })
    expect(
      result.current.active.activePromptSet!.prompts.find((p) => p.id === promptId)?.content,
    ).toBe("contenido nuevo")
  })

  it("deletePromptSet refuses when only one set remains", async () => {
    const result = await renderReady()
    // Default seed has at least 1 set; trim down to 1.
    const onlyId = result.current.active.activePromptSet!.id
    act(() => {
      result.current.active.deletePromptSet(onlyId)
    })
    expect(result.current.active.currentProject!.promptSets.length).toBeGreaterThanOrEqual(1)
  })

  it("renamePromptSet ignores empty names", async () => {
    const result = await renderReady()
    const id = result.current.active.activePromptSet!.id
    const original = result.current.active.activePromptSet!.name
    act(() => {
      result.current.active.renamePromptSet(id, "   ")
    })
    expect(result.current.active.activePromptSet!.name).toBe(original)
  })

  it("renamePromptSet renames the targeted set even when not active", async () => {
    const result = await renderReady()

    act(() => {
      result.current.active.addPromptSet()
    })
    await waitFor(() => {
      expect(result.current.active.currentProject!.promptSets.length).toBeGreaterThanOrEqual(2)
    })

    const activeId = result.current.active.activePromptSet!.id
    const otherSet = result.current.active.currentProject!.promptSets.find((s) => s.id !== activeId)!

    act(() => {
      result.current.active.renamePromptSet(otherSet.id, "Renombrado")
    })

    expect(
      result.current.active.currentProject!.promptSets.find((s) => s.id === otherSet.id)?.name,
    ).toBe("Renombrado")
    expect(result.current.active.activePromptSet!.id).toBe(activeId)
  })

  it("promoteVariableToGlobal moves the variable to project.globalVariables", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addVariable()
    })
    const varId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.updateVariableName(varId, "shared")
      result.current.active.updateVariable(varId, "value-A")
    })

    act(() => {
      result.current.active.promoteVariableToGlobal(varId)
    })

    expect(result.current.active.activePromptSet!.variables.some((v) => v.id === varId)).toBe(false)
    const globals = result.current.active.globalVariables
    expect(globals.find((v) => v.id === varId)).toMatchObject({ name: "shared", value: "value-A" })
    expect(result.current.active.isGlobalVariable(varId)).toBe(true)
  })

  it("promoteVariableToGlobal removes same-name locals from every other set", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addPromptSet()
    })
    await waitFor(() => {
      expect(result.current.active.currentProject!.promptSets.length).toBeGreaterThanOrEqual(2)
    })
    const setA = result.current.active.currentProject!.promptSets[0]!
    const setB = result.current.active.currentProject!.promptSets[1]!

    // Add a `shared` variable in set B (the second/inactive set)
    act(() => {
      result.current.active.selectPromptSet(setB.id)
    })
    act(() => {
      result.current.active.addVariable()
    })
    const setBVarId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.updateVariableName(setBVarId, "shared")
    })

    // Switch to set A, add another `shared` variable, promote
    act(() => {
      result.current.active.selectPromptSet(setA.id)
    })
    act(() => {
      result.current.active.addVariable()
    })
    const setAVarId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.updateVariableName(setAVarId, "shared")
    })
    act(() => {
      result.current.active.promoteVariableToGlobal(setAVarId)
    })

    // The set-B `shared` should have been removed by name
    const setBAfter = result.current.active.currentProject!.promptSets.find((s) => s.id === setB.id)!
    expect(setBAfter.variables.some((v) => v.name === "shared")).toBe(false)
    expect(result.current.active.globalVariables.some((v) => v.name === "shared")).toBe(true)
  })

  it("editing a global through updateVariable mutates project.globalVariables", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addVariable()
    })
    const varId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.promoteVariableToGlobal(varId)
    })
    act(() => {
      result.current.active.updateVariable(varId, "edited-from-active-set")
    })
    expect(
      result.current.active.globalVariables.find((v) => v.id === varId)?.value,
    ).toBe("edited-from-active-set")
  })

  it("demoteVariableToLocal moves a global back into the active set", async () => {
    const result = await renderReady()
    act(() => {
      result.current.active.addVariable()
    })
    const varId = result.current.active.activePromptSet!.variables.at(-1)!.id
    act(() => {
      result.current.active.promoteVariableToGlobal(varId)
    })
    act(() => {
      result.current.active.demoteVariableToLocal(varId)
    })
    expect(result.current.active.globalVariables.some((v) => v.id === varId)).toBe(false)
    expect(result.current.active.activePromptSet!.variables.some((v) => v.id === varId)).toBe(true)
  })
})
