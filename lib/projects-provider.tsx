"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useProjects, type UseProjectsResult } from "@/lib/hooks/use-projects"

const ProjectsContext = createContext<UseProjectsResult | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const projectsState = useProjects()
  return <ProjectsContext.Provider value={projectsState}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext(): UseProjectsResult {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjectsContext must be used within ProjectsProvider")
  }
  return context
}
