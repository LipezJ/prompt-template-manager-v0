"use client"

import { PanelLeft, ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/prompt"

interface DashboardHeaderProps {
  currentProject?: Project
  currentPromptSetId?: string
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function DashboardHeader({
  currentProject,
  currentPromptSetId,
  sidebarCollapsed,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const currentPromptSet = currentProject?.promptSets.find(
    (s) => s.id === currentPromptSetId
  )

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-3">
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {currentProject ? (
          <>
            <span className="text-muted-foreground">{currentProject.name}</span>
            {currentPromptSet && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex items-center gap-1.5 text-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {currentPromptSet.name}
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-foreground font-medium">Todos los proyectos</span>
        )}
      </nav>

      <div className="flex-1" />

      {/* Stats badge */}
      {currentPromptSet && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-secondary">
            {currentPromptSet.prompts.length} prompt{currentPromptSet.prompts.length !== 1 ? "s" : ""}
          </span>
          <span className="px-2 py-1 rounded-md bg-secondary">
            {currentPromptSet.variables.length} variable{currentPromptSet.variables.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </header>
  )
}
