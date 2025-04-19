"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { PlusIcon, FolderIcon, MoreVertical, Trash2, Download, Upload, GripVertical } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
import { ImportProjectDialog } from "./import-project-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "@/types/prompt"
import { NavigationBar } from "./navigation-bar"
import { EditModeToggle } from "./edit-mode-toggle"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SortableProjectItemProps {
  project: Project
  isEditMode: boolean
  onDeleteClick: (e: React.MouseEvent, id: string) => void
  onExportProject: (e: React.MouseEvent, project: Project) => void
  handleProjectOptions: (e: React.MouseEvent) => void
}

function SortableProjectItem({
  project,
  isEditMode,
  onDeleteClick,
  onExportProject,
  handleProjectOptions,
}: SortableProjectItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-colors relative ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {isEditMode && (
        <div
          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-zinc-500" />
        </div>
      )}
      <Link href={`/projects/${project.id}`} className={`block p-4 ${isEditMode ? "pointer-events-none pl-12" : ""}`}>
        <div className="flex items-center mb-2">
          <FolderIcon className="h-5 w-5 text-zinc-400 mr-2" />
          <h2 className="text-base font-medium truncate">{project.name}</h2>
        </div>
        <div className="text-xs text-zinc-400">
          {project.promptSets.length} conjunto{project.promptSets.length !== 1 ? "s" : ""} de prompts
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-700" onClick={handleProjectOptions}>
              <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
            <DropdownMenuItem onClick={(e) => onExportProject(e, project)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            {/* Only show delete option if there's more than one project */}
            <DropdownMenuItem
              onClick={(e) => onDeleteClick(e, project.id)}
              className="text-red-400 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar proyecto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function ProjectGrid() {
  const router = useRouter()
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [
    {
      id: "default",
      name: "Mi Primer Proyecto",
      promptSets: [
        {
          id: "set1",
          name: "prompt set",
          variables: [
            { id: "name", name: "name", value: "Juan" },
            { id: "role", name: "role", value: "asistente" },
            { id: "task", name: "task", value: "crear un plan de marketing" },
          ],
          prompts: [
            {
              id: "prompt1",
              content: "Hello {name}\nYou are {role}\nplease help me with {task}",
            },
            {
              id: "prompt2",
              content: "Now, as a {role}, for the {task}",
            },
          ],
        },
      ],
    },
  ])

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const addProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: `Nuevo Proyecto ${projects.length + 1}`,
      promptSets: [
        {
          id: `set-${Date.now()}`,
          name: "Prompt Set 1",
          variables: [],
          prompts: [{ id: `prompt-${Date.now()}`, content: "Nuevo prompt" }],
        },
      ],
    }

    setProjects([...projects, newProject])
  }

  const deleteProject = (projectId: string) => {
    if (projects.length <= 1) return // Prevent deleting the last project
    const updatedProjects = projects.filter((project) => project.id !== projectId)
    setProjects(updatedProjects)
  }

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
    // Prevent navigation when clicking the dropdown
    e.preventDefault()
    e.stopPropagation()
  }

  const handleExportProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Create a copy of the project to export
      const projectToExport = { ...project }

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(projectToExport, null, 2)

      // Copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          alert("Proyecto exportado al portapapeles")
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err)
          alert("Error al exportar. Consulta la consola para más detalles.")
        })
    } catch (error) {
      console.error("Error al exportar el proyecto:", error)
      alert("Error al exportar. Consulta la consola para más detalles.")
    }
  }

  const handleImportProject = (project: Project) => {
    setProjects([...projects, project])
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <NavigationBar projects={projects} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Mis Proyectos</h1>
            <div className="flex space-x-2">
              <EditModeToggle isEditMode={isEditMode} onToggle={toggleEditMode} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsImportDialogOpen(true)}
                      className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Importar Proyecto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    isEditMode={isEditMode}
                    onDeleteClick={handleDeleteClick}
                    onExportProject={handleExportProject}
                    handleProjectOptions={handleProjectOptions}
                  />
                ))}
              </SortableContext>

              {/* Add new project card */}
              {!isEditMode && (
                <button
                  onClick={addProject}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 border-dashed hover:border-zinc-500 hover:bg-zinc-750 transition-colors flex flex-col items-center justify-center p-5 h-full"
                >
                  <PlusIcon className="h-6 w-6 text-zinc-500 mb-2" />
                  <span className="text-sm text-zinc-400">Nuevo Proyecto</span>
                </button>
              )}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 shadow-xl p-4 opacity-80">
                  <div className="flex items-center mb-2">
                    <FolderIcon className="h-5 w-5 text-zinc-400 mr-2" />
                    <h2 className="text-base font-medium truncate">{projects.find((p) => p.id === activeId)?.name}</h2>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
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
        onImport={handleImportProject}
      />
    </div>
  )
}
