"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { arrayMove } from "@dnd-kit/sortable"
import type { Prompt, Project, PromptSet, PromptVariable, SelectOption, VariableType } from "@/types/prompt"
import { newId } from "@/lib/ids"
import type { UseProjectsResult } from "./use-projects"

type UiPreferences = NonNullable<PromptSet["uiPreferences"]>

const DEFAULT_UI_PREFERENCES: UiPreferences = {
  splitPosition: 50,
  variablesPanelVisible: true,
  cardView: false,
}

export interface UseActivePromptSetResult {
  currentProject: Project | undefined
  activePromptSet: PromptSet | undefined
  activePromptSetId: string
  selectPromptSet: (id: string) => void

  addPromptSet: () => void
  deletePromptSet: (id: string) => void
  renamePromptSet: (id: string, name: string) => void
  reorderPromptSets: (oldIndex: number, newIndex: number) => void
  updateUiPreferences: (updates: Partial<UiPreferences>) => void

  globalVariables: PromptVariable[]
  isGlobalVariable: (id: string) => boolean

  addVariable: () => void
  updateVariable: (id: string, value: string) => void
  updateVariableName: (id: string, name: string) => void
  updateVariableDescription: (id: string, description: string) => void
  updateVariableType: (id: string, type: VariableType) => void
  updateVariableOptional: (id: string, optional: boolean) => void
  updateVariableOptions: (id: string, options: SelectOption[]) => void
  deleteVariable: (id: string) => void
  clearAllVariableValues: () => void
  reorderVariables: (oldIndex: number, newIndex: number) => void
  reorderGlobalVariables: (oldIndex: number, newIndex: number) => void

  promoteVariableToGlobal: (id: string) => void
  demoteVariableToLocal: (id: string) => void

  addPrompt: () => void
  updatePrompt: (id: string, content: string) => void
  updatePromptDescription: (id: string, description: string) => void
  deletePrompt: (id: string) => void
  reorderPrompts: (oldIndex: number, newIndex: number) => void
}

export function useActivePromptSet(
  projectId: string,
  projectsState: UseProjectsResult,
): UseActivePromptSetResult {
  const { projects, updateProject } = projectsState
  const searchParams = useSearchParams()
  const setIdFromUrl = searchParams.get("set")

  const currentProject = projects.find((p) => p.id === projectId) ?? projects[0]

  const [activePromptSetId, setActivePromptSetId] = useState<string>(
    () => currentProject?.promptSets[0]?.id ?? "",
  )

  useEffect(() => {
    if (!currentProject?.promptSets?.length) return
    if (setIdFromUrl && currentProject.promptSets.some((s) => s.id === setIdFromUrl)) {
      setActivePromptSetId(setIdFromUrl)
      return
    }
    setActivePromptSetId(currentProject.promptSets[0].id)
  }, [currentProject, setIdFromUrl])

  const activePromptSet = currentProject?.promptSets.find((s) => s.id === activePromptSetId)

  const globalVariables = useMemo(
    () => currentProject?.globalVariables ?? [],
    [currentProject?.globalVariables],
  )

  const isGlobalVariable = useCallback(
    (id: string) => globalVariables.some((v) => v.id === id),
    [globalVariables],
  )

  const selectPromptSet = useCallback((id: string) => {
    setActivePromptSetId(id)
    const url = new URL(window.location.href)
    url.searchParams.set("set", id)
    window.history.pushState({}, "", url.toString())
  }, [])

  const patchActiveSet = useCallback(
    (patch: (set: PromptSet) => PromptSet) => {
      if (!currentProject || !activePromptSet) return
      const setId = activePromptSet.id
      updateProject(currentProject.id, (project) => ({
        ...project,
        promptSets: project.promptSets.map((set) => (set.id === setId ? patch(set) : set)),
      }))
    },
    [currentProject, activePromptSet, updateProject],
  )

  const patchVariableById = useCallback(
    (id: string, transform: (variable: PromptVariable) => PromptVariable) => {
      if (!currentProject) return
      if (isGlobalVariable(id)) {
        updateProject(currentProject.id, (project) => ({
          ...project,
          globalVariables: (project.globalVariables ?? []).map((v) => (v.id === id ? transform(v) : v)),
        }))
        return
      }
      patchActiveSet((set) => ({
        ...set,
        variables: set.variables.map((v) => (v.id === id ? transform(v) : v)),
      }))
    },
    [currentProject, isGlobalVariable, updateProject, patchActiveSet],
  )

  const addPromptSet = useCallback(() => {
    if (!currentProject) return
    const newSet: PromptSet = {
      id: newId("set"),
      name: `Nuevo Set ${currentProject.promptSets.length + 1}`,
      variables: [],
      prompts: [{ id: newId("prompt"), content: "Nuevo prompt" }],
      uiPreferences: { ...DEFAULT_UI_PREFERENCES },
    }
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: [...project.promptSets, newSet],
    }))
    setActivePromptSetId(newSet.id)
    const url = new URL(window.location.href)
    url.searchParams.set("set", newSet.id)
    window.history.pushState({}, "", url.toString())
  }, [currentProject, updateProject])

  const deletePromptSet = useCallback(
    (id: string) => {
      if (!currentProject) return
      if (currentProject.promptSets.length <= 1) return
      const remaining = currentProject.promptSets.filter((s) => s.id !== id)
      updateProject(currentProject.id, (project) => ({ ...project, promptSets: remaining }))
      if (id === activePromptSetId && remaining.length > 0) {
        setActivePromptSetId(remaining[0].id)
      }
    },
    [currentProject, activePromptSetId, updateProject],
  )

  const renamePromptSet = useCallback(
    (id: string, name: string) => {
      if (!currentProject) return
      if (name.trim() === "") return
      updateProject(currentProject.id, (project) => ({
        ...project,
        promptSets: project.promptSets.map((set) => (set.id === id ? { ...set, name } : set)),
      }))
    },
    [currentProject, updateProject],
  )

  const reorderPromptSets = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!currentProject) return
      updateProject(currentProject.id, (project) => ({
        ...project,
        promptSets: arrayMove(project.promptSets, oldIndex, newIndex),
      }))
    },
    [currentProject, updateProject],
  )

  const updateUiPreferences = useCallback(
    (updates: Partial<UiPreferences>) => {
      patchActiveSet((set) => ({
        ...set,
        uiPreferences: { ...DEFAULT_UI_PREFERENCES, ...set.uiPreferences, ...updates },
      }))
    },
    [patchActiveSet],
  )

  const addVariable = useCallback(() => {
    const variable: PromptVariable = { id: newId("var"), name: "nueva_variable", value: "" }
    patchActiveSet((set) => ({ ...set, variables: [...set.variables, variable] }))
  }, [patchActiveSet])

  const updateVariable = useCallback(
    (id: string, value: string) => {
      patchVariableById(id, (v) => ({ ...v, value }))
    },
    [patchVariableById],
  )

  const updateVariableName = useCallback(
    (id: string, name: string) => {
      patchVariableById(id, (v) => ({ ...v, name }))
    },
    [patchVariableById],
  )

  const updateVariableDescription = useCallback(
    (id: string, description: string) => {
      patchVariableById(id, (v) => ({
        ...v,
        description: description.trim() === "" ? undefined : description,
      }))
    },
    [patchVariableById],
  )

  const updateVariableType = useCallback(
    (id: string, type: VariableType) => {
      patchVariableById(id, (v) => {
        const next: PromptVariable = { ...v, type }
        if (type === "boolean") {
          next.value = v.value === "true" ? "true" : "false"
          delete next.options
        } else if (type === "select") {
          const opts = v.options ?? []
          next.options = opts
          const isStillValid = opts.some((o) => o.value === v.value)
          if (!isStillValid) next.value = opts[0]?.value ?? ""
        } else {
          delete next.options
          if (v.type === "boolean") next.value = ""
        }
        return next
      })
    },
    [patchVariableById],
  )

  const updateVariableOptional = useCallback(
    (id: string, optional: boolean) => {
      patchVariableById(id, (v) => ({ ...v, optional: optional || undefined }))
    },
    [patchVariableById],
  )

  const updateVariableOptions = useCallback(
    (id: string, options: SelectOption[]) => {
      patchVariableById(id, (v) => {
        const isStillValid = options.some((o) => o.value === v.value)
        return {
          ...v,
          options,
          value: isStillValid ? v.value : options[0]?.value ?? "",
        }
      })
    },
    [patchVariableById],
  )

  const deleteVariable = useCallback(
    (id: string) => {
      if (!currentProject) return
      if (isGlobalVariable(id)) {
        updateProject(currentProject.id, (project) => ({
          ...project,
          globalVariables: (project.globalVariables ?? []).filter((v) => v.id !== id),
        }))
        return
      }
      patchActiveSet((set) => ({ ...set, variables: set.variables.filter((v) => v.id !== id) }))
    },
    [currentProject, isGlobalVariable, updateProject, patchActiveSet],
  )

  const clearAllVariableValues = useCallback(() => {
    if (!currentProject) return
    const setId = activePromptSet?.id
    updateProject(currentProject.id, (project) => ({
      ...project,
      globalVariables: (project.globalVariables ?? []).map((v) => ({ ...v, value: "" })),
      promptSets: project.promptSets.map((set) =>
        set.id === setId ? { ...set, variables: set.variables.map((v) => ({ ...v, value: "" })) } : set,
      ),
    }))
  }, [currentProject, activePromptSet?.id, updateProject])

  const reorderVariables = useCallback(
    (oldIndex: number, newIndex: number) => {
      patchActiveSet((set) => ({ ...set, variables: arrayMove(set.variables, oldIndex, newIndex) }))
    },
    [patchActiveSet],
  )

  const reorderGlobalVariables = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!currentProject) return
      updateProject(currentProject.id, (project) => ({
        ...project,
        globalVariables: arrayMove(project.globalVariables ?? [], oldIndex, newIndex),
      }))
    },
    [currentProject, updateProject],
  )

  const promoteVariableToGlobal = useCallback(
    (id: string) => {
      if (!currentProject) return
      updateProject(currentProject.id, (project) => {
        let variable: PromptVariable | undefined
        for (const set of project.promptSets) {
          const found = set.variables.find((v) => v.id === id)
          if (found) {
            variable = found
            break
          }
        }
        if (!variable) return project
        const promoted = variable
        return {
          ...project,
          promptSets: project.promptSets.map((set) => ({
            ...set,
            variables: set.variables.filter(
              (v) => v.id !== promoted.id && v.name !== promoted.name,
            ),
          })),
          globalVariables: [
            ...(project.globalVariables ?? []).filter((v) => v.name !== promoted.name),
            { ...promoted },
          ],
        }
      })
    },
    [currentProject, updateProject],
  )

  const demoteVariableToLocal = useCallback(
    (id: string) => {
      if (!currentProject || !activePromptSet) return
      const setId = activePromptSet.id
      updateProject(currentProject.id, (project) => {
        const variable = (project.globalVariables ?? []).find((v) => v.id === id)
        if (!variable) return project
        return {
          ...project,
          globalVariables: (project.globalVariables ?? []).filter((v) => v.id !== id),
          promptSets: project.promptSets.map((set) =>
            set.id === setId ? { ...set, variables: [...set.variables, { ...variable }] } : set,
          ),
        }
      })
    },
    [currentProject, activePromptSet, updateProject],
  )

  const addPrompt = useCallback(() => {
    const prompt: Prompt = { id: newId("prompt"), content: "Nuevo prompt" }
    patchActiveSet((set) => ({ ...set, prompts: [...set.prompts, prompt] }))
  }, [patchActiveSet])

  const updatePrompt = useCallback(
    (id: string, content: string) => {
      patchActiveSet((set) => ({
        ...set,
        prompts: set.prompts.map((p) => (p.id === id ? { ...p, content } : p)),
      }))
    },
    [patchActiveSet],
  )

  const updatePromptDescription = useCallback(
    (id: string, description: string) => {
      patchActiveSet((set) => ({
        ...set,
        prompts: set.prompts.map((p) =>
          p.id === id ? { ...p, description: description.trim() === "" ? undefined : description } : p,
        ),
      }))
    },
    [patchActiveSet],
  )

  const deletePrompt = useCallback(
    (id: string) => {
      patchActiveSet((set) => ({ ...set, prompts: set.prompts.filter((p) => p.id !== id) }))
    },
    [patchActiveSet],
  )

  const reorderPrompts = useCallback(
    (oldIndex: number, newIndex: number) => {
      patchActiveSet((set) => ({ ...set, prompts: arrayMove(set.prompts, oldIndex, newIndex) }))
    },
    [patchActiveSet],
  )

  return {
    currentProject,
    activePromptSet,
    activePromptSetId,
    selectPromptSet,
    addPromptSet,
    deletePromptSet,
    renamePromptSet,
    reorderPromptSets,
    updateUiPreferences,
    globalVariables,
    isGlobalVariable,
    addVariable,
    updateVariable,
    updateVariableName,
    updateVariableDescription,
    updateVariableType,
    updateVariableOptional,
    updateVariableOptions,
    deleteVariable,
    clearAllVariableValues,
    reorderVariables,
    reorderGlobalVariables,
    promoteVariableToGlobal,
    demoteVariableToLocal,
    addPrompt,
    updatePrompt,
    updatePromptDescription,
    deletePrompt,
    reorderPrompts,
  }
}
