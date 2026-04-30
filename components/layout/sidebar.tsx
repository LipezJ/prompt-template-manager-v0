"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Upload,
  Search,
  PanelLeftClose,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { ImportProjectDialog } from "@/components/dialogs/import-project-dialog"
import type { Project } from "@/types/prompt"
import { cn } from "@/lib/utils"

interface SidebarProps {
  projects: Project[]
  currentProject?: Project
  currentPromptSetId?: string
  isLoaded: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  onAddProject: () => Project
  onDeleteProject: (id: string) => void
  onImportProject: (project: Project) => void
}

export function Sidebar({
  projects,
  currentProject,
  currentPromptSetId,
  isLoaded,
  collapsed,
  onToggleCollapse,
  onAddProject,
  onDeleteProject,
  onImportProject,
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(currentProject ? [currentProject.id] : [])
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const filteredProjects = searchQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.promptSets.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : projects

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete)
      setProjectToDelete(null)
    }
  }

  const handleAddProject = () => {
    const newProject = onAddProject()
    setExpandedProjects((prev) => new Set([...prev, newProject.id]))
  }

  if (collapsed) {
    return (
      <div className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-2 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="h-8 w-8 text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                >
                  <PanelLeftClose className="h-4 w-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 py-2 flex flex-col items-center gap-1">
          {filteredProjects.slice(0, 8).map((project) => (
            <TooltipProvider key={project.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/projects/${project.id}`}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                      currentProject?.id === project.id
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Folder className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{project.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Prompts</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="h-7 w-7 text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Colapsar sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-sm bg-sidebar-accent border-0 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-2 flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddProject}
            className="flex-1 h-8 justify-start gap-2 text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs">Nuevo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="flex-1 h-8 justify-start gap-2 text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs">Importar</span>
          </Button>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-auto custom-scrollbar px-2 pb-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-2">
            Proyectos
          </div>
          {isLoaded && (
            <div className="space-y-0.5">
              {filteredProjects.map((project) => {
                const isExpanded = expandedProjects.has(project.id)
                const isActive = currentProject?.id === project.id && !currentPromptSetId

                return (
                  <div key={project.id}>
                    {/* Project Item */}
                    <div
                      className={cn(
                        "group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-foreground"
                          : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <button
                        onClick={() => toggleProject(project.id)}
                        className="p-0.5 hover:bg-sidebar-accent rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 flex items-center gap-2 truncate"
                      >
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{project.name}</span>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent rounded transition-opacity">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => setProjectToDelete(project.id)}
                            className="text-destructive focus:text-destructive"
                            disabled={projects.length <= 1}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Prompt Sets */}
                    {isExpanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {project.promptSets.map((promptSet) => {
                          const isPromptSetActive =
                            currentProject?.id === project.id &&
                            currentPromptSetId === promptSet.id

                          return (
                            <Link
                              key={promptSet.id}
                              href={`/projects/${project.id}/prompt-sets?tab=${promptSet.id}`}
                              className={cn(
                                "relative flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                                isPromptSetActive
                                  ? "bg-sidebar-accent text-foreground"
                                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                              )}
                            >
                              {isPromptSetActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
                              )}
                              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{promptSet.name}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {promptSet.prompts.length}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-[10px] text-muted-foreground text-center">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar proyecto"
        description="Esta accion eliminara el proyecto y todos sus conjuntos de prompts. Esta accion no se puede deshacer."
      />

      <ImportProjectDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={onImportProject}
      />
    </>
  )
}
