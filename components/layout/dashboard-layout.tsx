"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { DashboardHeader } from "./dashboard-header"
import type { Project } from "@/types/prompt"

interface DashboardLayoutProps {
  children: React.ReactNode
  projects: Project[]
  currentProject?: Project
  currentPromptSetId?: string
  isLoaded: boolean
  onAddProject: () => Project
  onDeleteProject: (id: string) => void
  onImportProject: (project: Project) => void
}

export function DashboardLayout({
  children,
  projects,
  currentProject,
  currentPromptSetId,
  isLoaded,
  onAddProject,
  onDeleteProject,
  onImportProject,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        currentPromptSetId={currentPromptSetId}
        isLoaded={isLoaded}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onAddProject={onAddProject}
        onDeleteProject={onDeleteProject}
        onImportProject={onImportProject}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          currentProject={currentProject}
          currentPromptSetId={currentPromptSetId}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
