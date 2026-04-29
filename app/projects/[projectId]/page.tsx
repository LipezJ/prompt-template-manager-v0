"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { NavigationBar } from "@/components/layout/navigation-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, FileTextIcon, MoreVertical, Pencil, Trash2, Download, GripVertical, Upload } from "lucide-react"
import { newId } from "@/lib/ids"
import { useProjects } from "@/lib/hooks/use-projects"
import type { PromptSet } from "@/types/prompt"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { ImportPromptSetDialog } from "@/components/dialogs/import-prompt-set-dialog"
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

  const { projects, updateProject, deleteProject } = useProjects()
  const currentProject = projects.find((p) => p.id === projectId) ?? projects[0]

  const [isEditingName, setIsEditingName] = useState(false)
  const [projectName, setProjectName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [promptSetToDelete, setPromptSetToDelete] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isImportPromptSetDialogOpen, setIsImportPromptSetDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const addPromptSet = () => {
    if (!currentProject) return
    const newPromptSet: PromptSet = {
      id: newId("set"),
      name: `Nuevo Set ${currentProject.promptSets.length + 1}`,
      variables: [],
      prompts: [{ id: newId("prompt"), content: "Nuevo prompt" }],
    }
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: [...project.promptSets, newPromptSet],
    }))
  }

  const updateProjectName = (name: string) => {
    if (!currentProject || name.trim() === "") return
    updateProject(currentProject.id, (project) => ({ ...project, name }))
  }

  const handleEditName = () => {
    setIsEditingName(true)
    setProjectName(currentProject?.name ?? "")
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleSaveName = () => {
    updateProjectName(projectName)
    setIsEditingName(false)
  }

  const confirmDeleteProject = () => {
    if (!currentProject) return
    if (projects.length <= 1) return
    deleteProject(currentProject.id)
    const remaining = projects.filter((p) => p.id !== currentProject.id)
    if (remaining.length > 0) {
      router.push(`/projects/${remaining[0].id}`)
    } else {
      router.push("/")
    }
  }

  const removePromptSet = (promptSetId: string) => {
    if (!currentProject) return
    if (currentProject.promptSets.length <= 1) return
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: project.promptSets.filter((s) => s.id !== promptSetId),
    }))
    setPromptSetToDelete(null)
  }

  const handlePromptSetOptions = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const exportToClipboard = (label: string, payload: unknown) => {
    try {
      navigator.clipboard
        .writeText(JSON.stringify(payload, null, 2))
        .then(() => alert(`${label} exportado al portapapeles`))
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err)
          alert("Error al exportar. Consulta la consola para más detalles.")
        })
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al exportar. Consulta la consola para más detalles.")
    }
  }

  const handleExportProject = () => {
    if (!currentProject) return
    exportToClipboard("Proyecto", currentProject)
  }

  const handleExportPromptSet = (promptSetId: string) => {
    const promptSet = currentProject?.promptSets.find((s) => s.id === promptSetId)
    if (!promptSet) return
    exportToClipboard("Conjunto de prompts", promptSet)
  }

  const handleImportPromptSet = (promptSet: PromptSet) => {
    if (!currentProject) return
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: [...project.promptSets, promptSet],
    }))
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id && currentProject) {
      const oldIndex = currentProject.promptSets.findIndex((s) => s.id === active.id)
      const newIndex = currentProject.promptSets.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        updateProject(currentProject.id, (project) => ({
          ...project,
          promptSets: arrayMove(project.promptSets, oldIndex, newIndex),
        }))
      }
    }
    setActiveId(null)
  }

  if (!currentProject) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <NavigationBar projects={projects} currentProject={currentProject} />

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
            <div className="flex items-center space-x-2">
              <EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode((v) => !v)} />
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
                      onClick={() => setShowDeleteConfirmation(true)}
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
                <SortableContext items={currentProject.promptSets.map((s) => s.id)} strategy={rectSortingStrategy}>
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
                          {currentProject.promptSets.find((s) => s.id === activeId)?.name}
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

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteProject}
        title="Eliminar proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
      />

      <ConfirmationDialog
        isOpen={!!promptSetToDelete}
        onClose={() => setPromptSetToDelete(null)}
        onConfirm={() => promptSetToDelete && removePromptSet(promptSetToDelete)}
        title="Eliminar conjunto de prompts"
        description="¿Estás seguro de que deseas eliminar este conjunto de prompts? Esta acción no se puede deshacer."
      />

      <ImportPromptSetDialog
        isOpen={isImportPromptSetDialogOpen}
        onClose={() => setIsImportPromptSetDialogOpen(false)}
        onImport={handleImportPromptSet}
      />
    </div>
  )
}
