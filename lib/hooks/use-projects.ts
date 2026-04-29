"use client"

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import type { Project } from "@/types/prompt"
import { newId } from "@/lib/ids"
import { createDefaultProjects } from "@/lib/seed"
import { loadProjects, saveProjects } from "@/lib/storage/projects-repository"

export interface UseProjectsResult {
  projects: Project[]
  isLoaded: boolean
  setProjects: Dispatch<SetStateAction<Project[]>>
  addProject: () => Project
  deleteProject: (id: string) => void
  updateProject: (id: string, patch: (project: Project) => Project) => void
  reorderProjects: (oldIndex: number, newIndex: number) => void
  importProject: (project: Project) => void
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>(createDefaultProjects)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setProjects(loadProjects())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    saveProjects(projects)
  }, [projects, isLoaded])

  const addProject = useCallback<UseProjectsResult["addProject"]>(() => {
    const created: Project = {
      id: newId("project"),
      name: "",
      promptSets: [
        {
          id: newId("set"),
          name: "Prompt Set 1",
          variables: [],
          prompts: [{ id: newId("prompt"), content: "Nuevo prompt" }],
        },
      ],
    }
    setProjects((prev) => {
      created.name = `Nuevo Proyecto ${prev.length + 1}`
      return [...prev, created]
    })
    return created
  }, [])

  const deleteProject = useCallback<UseProjectsResult["deleteProject"]>((id) => {
    setProjects((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)))
  }, [])

  const updateProject = useCallback<UseProjectsResult["updateProject"]>((id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? patch(p) : p)))
  }, [])

  const reorderProjects = useCallback<UseProjectsResult["reorderProjects"]>((oldIndex, newIndex) => {
    setProjects((prev) => arrayMove(prev, oldIndex, newIndex))
  }, [])

  const importProject = useCallback<UseProjectsResult["importProject"]>((project) => {
    setProjects((prev) => [...prev, project])
  }, [])

  return { projects, isLoaded, setProjects, addProject, deleteProject, updateProject, reorderProjects, importProject }
}
