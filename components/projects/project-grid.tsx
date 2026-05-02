"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, FolderKanban, Upload } from "lucide-react"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { ImportProjectDialog } from "@/components/dialogs/import-project-dialog"
import type { Project } from "@/types/prompt"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { copyToClipboard } from "@/lib/toast"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { ProjectItem } from "./project-item"
import { AppShell } from "@/components/layout/app-shell"
import { useProjectsContext } from "@/lib/projects-provider"

export function ProjectGrid() {
  const { projects, isLoaded, addProject, deleteProject, importProject, setProjects } = useProjectsContext()

  const sortedProjects = useMemo(
    () =>
      projects
        .map((project, index) => ({ project, index }))
        .sort(
          (a, b) =>
            Number(Boolean(b.project.pinned)) - Number(Boolean(a.project.pinned)) || a.index - b.index,
        )
        .map(({ project }) => project),
    [projects],
  )

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setProjectToDelete(id)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete)
      setProjectToDelete(null)
    }
  }

  const handleProjectOptions = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleExportProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()
    void copyToClipboard(JSON.stringify(project, null, 2), "Proyecto exportado al portapapeles")
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = sortedProjects.findIndex((p) => p.id === active.id)
      const newIndex = sortedProjects.findIndex((p) => p.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        setProjects(arrayMove(sortedProjects, oldIndex, newIndex))
      }
    }
    setActiveId(null)
  }

  return (
    <AppShell
      projects={isLoaded ? projects : []}
      title="Proyectos"
      eyebrow="Biblioteca"
      hideHeader
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold leading-tight text-white">Proyectos</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-silver">
              {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
            </p>
            <div className="flex items-center gap-2">
              <EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode((v) => !v)} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsImportDialogOpen(true)}
                      className="h-9 w-9 rounded-2xl border-iron bg-deep-charcoal text-fog hover:bg-graphite hover:text-white"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Importar Proyecto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {isLoaded && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            accessibility={{ announcements: dndAnnouncements }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SortableContext items={sortedProjects.map((p) => p.id)} strategy={rectSortingStrategy}>
                {sortedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    index={projects.findIndex((p) => p.id === project.id)}
                    isEditMode={isEditMode}
                    onDeleteClick={handleDeleteClick}
                    onExportProject={handleExportProject}
                    handleProjectOptions={handleProjectOptions}
                  />
                ))}
              </SortableContext>

              {!isEditMode && (
                <button
                  onClick={() => addProject()}
                  className="app-focus app-card-subtle flex min-h-44 flex-col items-center justify-center border-dashed p-6 text-center transition hover:border-violet-pulse hover:bg-[rgba(90,31,208,0.18)]"
                >
                  <PlusIcon className="mb-3 h-6 w-6 text-electric-blue" />
                  <span className="text-sm font-medium text-white">Nuevo Proyecto</span>
                  <span className="mt-1 text-xs text-fog">Crear un espacio de prompts</span>
                </button>
              )}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="app-card-subtle p-4 opacity-90">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-amethyst" />
                    <h2 className="truncate text-base font-medium text-white">
                      {projects.find((p) => p.id === activeId)?.name}
                    </h2>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
      />

      <ImportProjectDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={importProject}
      />
    </AppShell>
  )
}
