"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, FileTextIcon, MoreVertical, Pencil, Trash2, Download, GripVertical, Upload } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Project, PromptSet } from "@/types/prompt"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import { ImportPromptSetDialog } from "@/components/import-prompt-set-dialog"
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
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SortablePromptSetItemProps {
  promptSetId: string
  projectId: string
  name: string
  promptsCount: number
  variablesCount: number
  isEditMode: boolean
  onDeleteClick: (id: string) => void
  onExportPromptSet: (id: string) => void
  handlePromptSetOptions: (e: React.MouseEvent, promptSetId: string) => void
}

function SortablePromptSetItem({
  promptSetId,
  projectId,
  name,
  promptsCount,
  variablesCount,
  isEditMode,
  onDeleteClick,
  onExportPromptSet,
  handlePromptSetOptions,
}: SortablePromptSetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: promptSetId,
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
      className={`bg-zinc-800 rounded-lg p-3 border border-zinc-700 hover:border-zinc-600 transition-colors relative ${
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
      <Link
        href={`/projects/${projectId}/prompt-sets?set=${promptSetId}`}
        className={`block ${isEditMode ? "pointer-events-none pl-8" : ""}`}
      >
        <div className="flex items-start">
          <FileTextIcon className="h-4 w-4 text-zinc-400 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">{name}</h3>
            <p className="text-xs text-zinc-400">
              {promptsCount} prompt{promptsCount !== 1 ? "s" : ""}, {variablesCount} variable
              {variablesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-zinc-700"
              onClick={(e) => handlePromptSetOptions(e, promptSetId)}
            >
              <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
            <DropdownMenuItem onClick={() => onExportPromptSet(promptSetId)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteClick(promptSetId)}
              className="text-red-400 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

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
        {
          id: "set2",
          name: "prompt set 2",
          variables: [
            { id: "name", name: "name", value: "María" },
            { id: "role", name: "role", value: "experto" },
          ],
          prompts: [
            {
              id: "prompt1",
              content: "Hola {name}, como {role}, ¿podrías ayudarme?",
            },
          ],
        },
      ],
    },
  ])

  const currentProject = projects.find((p) => p.id === projectId) || projects[0]

  // State for editing project name
  const [isEditingName, setIsEditingName] = useState(false)
  const [projectName, setProjectName] = useState(currentProject?.name || "")
  const inputRef = useRef<HTMLInputElement>(null)

  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // State for prompt set options
  const [promptSetToDelete, setPromptSetToDelete] = useState<string | null>(null)

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // State for import prompt set dialog
  const [isImportPromptSetDialogOpen, setIsImportPromptSetDialogOpen] = useState(false)

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

  const addPromptSet = () => {
    if (!currentProject) return

    const newPromptSet = {
      id: `set-${Date.now()}`,
      name: `Nuevo Set ${currentProject.promptSets.length + 1}`,
      variables: [],
      prompts: [{ id: `prompt-${Date.now()}`, content: "Nuevo prompt" }],
    }

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project
      return {
        ...project,
        promptSets: [...project.promptSets, newPromptSet],
      }
    })

    setProjects(updatedProjects)
  }

  const updateProjectName = (name: string) => {
    if (!currentProject || name.trim() === "") return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project
      return { ...project, name }
    })

    setProjects(updatedProjects)
  }

  const handleEditName = () => {
    setIsEditingName(true)
    setProjectName(currentProject?.name || "")
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleSaveName = () => {
    updateProjectName(projectName)
    setIsEditingName(false)
  }

  const handleDeleteProject = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteProject = () => {
    if (projects.length <= 1) return // Prevent deleting the last project

    const updatedProjects = projects.filter((project) => project.id !== currentProject.id)
    setProjects(updatedProjects)

    // Navigate to the first project
    if (updatedProjects.length > 0) {
      router.push(`/projects/${updatedProjects[0].id}`)
    } else {
      router.push("/")
    }
  }

  const deletePromptSet = (promptSetId: string) => {
    if (!currentProject) return
    if (currentProject.promptSets.length <= 1) return // Prevent deleting the last prompt set

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.filter((set) => set.id !== promptSetId)

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
    setPromptSetToDelete(null)
  }

  const handlePromptSetOptions = (e: React.MouseEvent, promptSetId: string) => {
    // Prevent navigation when clicking the dropdown
    e.preventDefault()
    e.stopPropagation()
  }

  const handleExportProject = () => {
    if (!currentProject) return

    try {
      // Create a copy of the project to export
      const projectToExport = { ...currentProject }

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

  const handleExportPromptSet = (promptSetId: string) => {
    if (!currentProject) return

    try {
      // Find the prompt set
      const promptSet = currentProject.promptSets.find((set) => set.id === promptSetId)
      if (!promptSet) return

      // Create a copy of the prompt set to export
      const promptSetToExport = { ...promptSet }

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(promptSetToExport, null, 2)

      // Copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          alert("Conjunto de prompts exportado al portapapeles")
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err)
          alert("Error al exportar. Consulta la consola para más detalles.")
        })
    } catch (error) {
      console.error("Error al exportar el conjunto de prompts:", error)
      alert("Error al exportar. Consulta la consola para más detalles.")
    }
  }

  const handleImportPromptSet = (promptSet: PromptSet) => {
    if (!currentProject) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project
      return {
        ...project,
        promptSets: [...project.promptSets, promptSet],
      }
    })

    setProjects(updatedProjects)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProjects((items) => {
        return items.map((project) => {
          if (project.id !== currentProject.id) return project

          const oldIndex = project.promptSets.findIndex((set) => set.id === active.id)
          const newIndex = project.promptSets.findIndex((set) => set.id === over.id)

          return {
            ...project,
            promptSets: arrayMove(project.promptSets, oldIndex, newIndex),
          }
        })
      })
    }

    setActiveId(null)
  }

  if (!currentProject) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      {/* Navigation Bar */}
      <NavigationBar projects={projects} currentProject={currentProject} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {isEditingName ? (
                <div className="flex items-center">
                  <Input
                    ref={inputRef}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName()
                      if (e.key === "Escape") setIsEditingName(false)
                    }}
                    className="h-8 w-64 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              ) : (
                <h1 className="text-xl font-bold group flex items-center">
                  <span>{currentProject.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditName}
                    className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                  </Button>
                </h1>
              )}
            </div>
            {/* Actualizar la sección de botones en la parte superior */}
            <div className="flex items-center space-x-2">
              <EditModeToggle isEditMode={isEditMode} onToggle={toggleEditMode} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/projects/${currentProject.id}/prompt-sets`}>
                      <Button size="icon" className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                        <FileTextIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver Prompt Sets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800">
                    <MoreVertical className="h-4 w-4 text-zinc-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
                  <DropdownMenuItem onClick={handleExportProject} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditName} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar nombre
                  </DropdownMenuItem>
                  {projects.length > 1 && (
                    <DropdownMenuItem
                      onClick={handleDeleteProject}
                      className="text-red-400 focus:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar proyecto
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-3">Información del Proyecto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-400 text-sm">Nombre del Proyecto</p>
                <p className="text-base">{currentProject.name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Conjuntos de Prompts</p>
                <p className="text-base">{currentProject.promptSets.length}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            {/* Actualizar el botón de nuevo conjunto */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Conjuntos de Prompts</h2>
              {!isEditMode && (
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsImportPromptSetDialogOpen(true)}
                          className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                        >
                          <Upload className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Importar Conjunto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={addPromptSet}
                          className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nuevo Conjunto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SortableContext items={currentProject.promptSets.map((set) => set.id)} strategy={rectSortingStrategy}>
                  {currentProject.promptSets.map((promptSet) => (
                    <SortablePromptSetItem
                      key={promptSet.id}
                      promptSetId={promptSet.id}
                      projectId={currentProject.id}
                      name={promptSet.name}
                      promptsCount={promptSet.prompts.length}
                      variablesCount={promptSet.variables.length}
                      isEditMode={isEditMode}
                      onDeleteClick={setPromptSetToDelete}
                      onExportPromptSet={handleExportPromptSet}
                      handlePromptSetOptions={handlePromptSetOptions}
                    />
                  ))}
                </SortableContext>

                {/* Add new prompt set card */}
                {!isEditMode && (
                  <button
                    onClick={addPromptSet}
                    className="bg-zinc-800 rounded-lg border border-zinc-700 border-dashed hover:border-zinc-500 hover:bg-zinc-750 transition-colors flex flex-col items-center justify-center p-3 h-full"
                  >
                    <PlusIcon className="h-5 w-5 text-zinc-500 mb-1" />
                    <span className="text-xs text-zinc-400">Nuevo Conjunto</span>
                  </button>
                )}
              </div>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 shadow-xl opacity-80">
                    <div className="flex items-start">
                      <FileTextIcon className="h-4 w-4 text-zinc-400 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">
                          {currentProject.promptSets.find((set) => set.id === activeId)?.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Delete Project Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteProject}
        title="Eliminar proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
      />

      {/* Delete Prompt Set Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!promptSetToDelete}
        onClose={() => setPromptSetToDelete(null)}
        onConfirm={() => promptSetToDelete && deletePromptSet(promptSetToDelete)}
        title="Eliminar conjunto de prompts"
        description="¿Estás seguro de que deseas eliminar este conjunto de prompts? Esta acción no se puede deshacer."
      />

      {/* Import Prompt Set Dialog */}
      <ImportPromptSetDialog
        isOpen={isImportPromptSetDialogOpen}
        onClose={() => setIsImportPromptSetDialogOpen(false)}
        onImport={handleImportPromptSet}
      />
    </div>
  )
}
