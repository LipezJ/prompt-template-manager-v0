"use client"

import Link from "next/link"
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Pencil, 
  MoreHorizontal,
  GripVertical,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import type { Project } from "@/types/prompt"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { cn } from "@/lib/utils"

interface ProjectDetailContentProps {
  project: Project
  isEditMode: boolean
  canDelete: boolean
  onToggleEditMode: () => void
  onRename: (name: string) => void
  onExport: () => void
  onDelete: () => void
  onAddPromptSet: () => void
  onDeletePromptSet: (id: string) => void
  onExportPromptSet: (id: string) => void
  onReorderPromptSets: (oldIndex: number, newIndex: number) => void
  onImportClick: () => void
}

interface SortablePromptSetCardProps {
  promptSet: Project["promptSets"][number]
  projectId: string
  isEditMode: boolean
  onDelete: (id: string) => void
  onExport: (id: string) => void
}

function SortablePromptSetCard({
  promptSet,
  projectId,
  isEditMode,
  onDelete,
  onExport,
}: SortablePromptSetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: promptSet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all",
        isDragging && "opacity-50"
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {isEditMode && (
            <button
              {...attributes}
              {...listeners}
              className="mt-1 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{promptSet.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{promptSet.prompts.length} prompts</span>
              <span>{promptSet.variables.length} variables</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onExport(promptSet.id)}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(promptSet.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview of prompts */}
        <div className="mt-4 space-y-2">
          {promptSet.prompts.slice(0, 2).map((prompt, idx) => (
            <div
              key={prompt.id}
              className="text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2 truncate"
            >
              <span className="text-muted-foreground/60 mr-2">#{idx + 1}</span>
              {prompt.content.slice(0, 60)}
              {prompt.content.length > 60 && "..."}
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <Link
        href={`/projects/${projectId}/prompt-sets?tab=${promptSet.id}`}
        className="flex items-center justify-between px-5 py-3 border-t border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-sm text-foreground">Editar prompts</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  )
}

export function ProjectDetailContent({
  project,
  isEditMode,
  canDelete,
  onToggleEditMode,
  onRename,
  onExport,
  onDelete,
  onAddPromptSet,
  onDeletePromptSet,
  onExportPromptSet,
  onReorderPromptSets,
  onImportClick,
}: ProjectDetailContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(project.name)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = project.promptSets.findIndex((s) => s.id === active.id)
      const newIndex = project.promptSets.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderPromptSets(oldIndex, newIndex)
      }
    }
    setActiveId(null)
  }

  const handleSaveName = () => {
    if (editName.trim() && editName !== project.name) {
      onRename(editName.trim())
    }
    setIsEditingName(false)
  }

  const totalPrompts = project.promptSets.reduce((acc, s) => acc + s.prompts.length, 0)
  const totalVariables = project.promptSets.reduce((acc, s) => acc + s.variables.length, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div>
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
                className="text-2xl font-semibold bg-transparent border-b border-primary focus:outline-none text-foreground"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
                <button
                  onClick={() => {
                    setEditName(project.name)
                    setIsEditingName(true)
                  }}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{project.promptSets.length} conjuntos</span>
              <span>{totalPrompts} prompts</span>
              <span>{totalVariables} variables</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EditModeToggle isEditMode={isEditMode} onToggle={onToggleEditMode} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onImportClick}
                  className="h-8 w-8"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Importar conjunto</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onExport}
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar proyecto</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {canDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onDelete}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar proyecto</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Prompt Sets Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-foreground">Conjuntos de Prompts</h2>
        <Button onClick={onAddPromptSet} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo conjunto
        </Button>
      </div>

      {/* Prompt Sets Grid */}
      <ErrorBoundary fallbackLabel="No se pudo renderizar la lista de conjuntos">
        <DndContext
          sensors={isEditMode ? sensors : []}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements: dndAnnouncements }}
        >
          <SortableContext
            items={project.promptSets.map((s) => s.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.promptSets.map((promptSet) => (
                <SortablePromptSetCard
                  key={promptSet.id}
                  promptSet={promptSet}
                  projectId={project.id}
                  isEditMode={isEditMode}
                  onDelete={onDeletePromptSet}
                  onExport={onExportPromptSet}
                />
              ))}

              {/* Add Prompt Set Card */}
              <button
                onClick={onAddPromptSet}
                className="group bg-card border border-dashed border-border rounded-xl p-5 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col items-center justify-center min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Nuevo conjunto
                </span>
              </button>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="bg-card border border-primary rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {project.promptSets.find((s) => s.id === activeId)?.name}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ErrorBoundary>
    </div>
  )
}
