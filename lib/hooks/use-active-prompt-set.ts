"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { arrayMove } from "@dnd-kit/sortable"
import type { Prompt, Project, PromptSet, PromptVariable } from "@/types/prompt"
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

  addVariable: () => void
  updateVariable: (id: string, value: string) => void
  updateVariableName: (id: string, name: string) => void
  updateVariableDescription: (id: string, description: string) => void
  deleteVariable: (id: string) => void
  clearAllVariableValues: () => void
  reorderVariables: (oldIndex: number, newIndex: number) => void

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
      patchActiveSet((set) => ({
        ...set,
        variables: set.variables.map((v) => (v.id === id ? { ...v, value } : v)),
      }))
    },
    [patchActiveSet],
  )

  const updateVariableName = useCallback(
    (id: string, name: string) => {
      patchActiveSet((set) => ({
        ...set,
        variables: set.variables.map((v) => (v.id === id ? { ...v, name } : v)),
      }))
    },
    [patchActiveSet],
  )

  const updateVariableDescription = useCallback(
    (id: string, description: string) => {
      patchActiveSet((set) => ({
        ...set,
        variables: set.variables.map((v) =>
          v.id === id ? { ...v, description: description.trim() === "" ? undefined : description } : v,
        ),
      }))
    },
    [patchActiveSet],
  )

  const deleteVariable = useCallback(
    (id: string) => {
      patchActiveSet((set) => ({ ...set, variables: set.variables.filter((v) => v.id !== id) }))
    },
    [patchActiveSet],
  )

  const clearAllVariableValues = useCallback(() => {
    patchActiveSet((set) => ({ ...set, variables: set.variables.map((v) => ({ ...v, value: "" })) }))
  }, [patchActiveSet])

  const reorderVariables = useCallback(
    (oldIndex: number, newIndex: number) => {
      patchActiveSet((set) => ({ ...set, variables: arrayMove(set.variables, oldIndex, newIndex) }))
    },
    [patchActiveSet],
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
    addVariable,
    updateVariable,
    updateVariableName,
    updateVariableDescription,
    deleteVariable,
    clearAllVariableValues,
    reorderVariables,
    addPrompt,
    updatePrompt,
    updatePromptDescription,
    deletePrompt,
    reorderPrompts,
  }
}
