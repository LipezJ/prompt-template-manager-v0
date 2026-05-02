"use client"

import type React from "react"

import { useMemo, useState, type FormEvent } from "react"
import { Search, Upload, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { ProjectItem } from "./project-item"
import { AppShell } from "@/components/layout/app-shell"
import { useProjectsContext } from "@/lib/projects-provider"

type FilterTab = "all" | "pinned" | "unpinned"

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pinned", label: "Fijados" },
  { id: "unpinned", label: "Sin fijar" },
]

export function ProjectGrid() {
  const { projects, isLoaded, addProject, deleteProject, importProject, setProjects } = useProjectsContext()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortedProjects.filter((project) => {
      if (filter === "pinned" && !project.pinned) return false
      if (filter === "unpinned" && project.pinned) return false
      if (q && !project.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [sortedProjects, filter, query])

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

  const handleSubmitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const totalCount = projects.length

  return (
    <AppShell projects={isLoaded ? projects : []} title="Proyectos" eyebrow="Biblioteca">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:px-8">
        <form onSubmit={handleSubmitSearch} className="flex w-full flex-col gap-3 md:flex-row">
          <div className="relative w-full">
            <label className="relative block w-full">
              <span className="sr-only">Buscar</span>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-ash">
                <Search aria-hidden="true" className="h-4 w-4" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Buscar en ${totalCount} ${totalCount === 1 ? "proyecto" : "proyectos"}…`}
                aria-label="Buscar proyectos"
                type="text"
                className="block h-9 w-full rounded-sm border border-iron bg-obsidian-ground py-2 pl-9 pr-3 text-sm text-white shadow-sm shadow-black/40 outline-none placeholder:italic placeholder:text-ash/80 focus-visible:border-electric-blue/70 focus-visible:ring-1 focus-visible:ring-electric-blue/40"
              />
            </label>
          </div>
          <Button type="submit" aria-label="Buscar" className="w-full sm:w-fit">
            Buscar
          </Button>
        </form>

        <div className="-mt-1 mb-2 flex w-full flex-wrap gap-1">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                aria-pressed={active}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "group flex h-6 select-none items-center justify-center gap-1.5 text-nowrap rounded-sm border px-1.5 font-mono-tight !text-xs tracking-tight transition active:translate-y-px active:scale-[.99]",
                  active
                    ? "border-electric-blue/20 bg-electric-blue/10 text-amethyst shadow-[hsl(218,50%,70%,0.08)_0_-2px_0_0_inset] hover:bg-electric-blue/20"
                    : "border-transparent text-silver hover:bg-graphite/60 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            )
          })}
          <div className="ml-auto flex items-center gap-2">
            <EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode((v) => !v)} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsImportDialogOpen(true)}
                    aria-label="Importar Proyecto"
                    className="group flex h-6 w-6 select-none items-center justify-center rounded-sm border border-transparent text-silver transition hover:bg-graphite/60 hover:text-white"
                  >
                    <Upload aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Importar Proyecto</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <SortableContext items={filteredProjects.map((p) => p.id)} strategy={rectSortingStrategy}>
                {filteredProjects.map((project) => (
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

              {!isEditMode && filter === "all" && query.trim() === "" && (
                <button
                  type="button"
                  onClick={() => addProject()}
                  className="app-focus group flex flex-col items-start gap-0.5 rounded-sm border border-dashed border-iron bg-deep-charcoal/40 p-2.5 text-left transition hover:border-electric-blue/50 hover:bg-graphite/60"
                >
                  <p className="truncate text-sm text-white group-hover:text-electric-blue">+ Nuevo proyecto</p>
                  <p className="w-[95%] truncate text-[.75rem] text-silver">Crear un espacio de prompts.</p>
                  <p className="min-h-[18px] truncate text-[.75rem] text-ash">Local</p>
                </button>
              )}

              {filteredProjects.length === 0 && (query.trim() !== "" || filter !== "all") && (
                <div className="col-span-full rounded-sm border border-dashed border-iron bg-deep-charcoal/40 p-6 text-center">
                  <p className="text-sm text-silver">Sin resultados.</p>
                  <p className="mt-1 text-xs text-ash">
                    Prueba con otro término o limpia los filtros.
                  </p>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="rounded-sm border border-iron bg-deep-charcoal p-2.5 opacity-95">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-3.5 w-3.5 text-electric-blue" />
                    <p className="truncate text-sm text-white">
                      {projects.find((p) => p.id === activeId)?.name}
                    </p>
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
