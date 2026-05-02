"use client"

import type React from "react"
import { useState } from "react"
import { FileTextIcon, PlusIcon, Upload } from "lucide-react"
import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { PromptSetItem } from "./prompt-set-item"

interface PromptSetGridProps {
  project: Project
  isEditMode: boolean
  onAddPromptSet: () => void
  onDeletePromptSet: (id: string) => void
  onExportPromptSet: (id: string) => void
  onRenamePromptSet: (id: string, name: string) => void
  onReorderPromptSets: (oldIndex: number, newIndex: number) => void
  onImportClick: () => void
  onToggleEditMode: () => void
}

export function PromptSetGrid({
  project,
  isEditMode,
  onAddPromptSet,
  onDeletePromptSet,
  onExportPromptSet,
  onRenamePromptSet,
  onReorderPromptSets,
  onImportClick,
  onToggleEditMode,
}: PromptSetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handlePromptSetOptions = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = project.promptSets.findIndex((s) => s.id === active.id)
      const newIndex = project.promptSets.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) onReorderPromptSets(oldIndex, newIndex)
    }
    setActiveId(null)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-b border-iron/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow">Coleccion</span>
          <h2 className="font-serif-display text-xl leading-tight text-electric-blue">Conjuntos de Prompts</h2>
        </div>
        <div className="flex items-center gap-2">
          <EditModeToggle isEditMode={isEditMode} onToggle={onToggleEditMode} />
          {!isEditMode && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onImportClick} className="h-8 w-8">
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
                    <Button variant="outline" size="icon" onClick={onAddPromptSet} className="h-8 w-8">
                      <PlusIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nuevo Conjunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements: dndAnnouncements }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SortableContext items={project.promptSets.map((s) => s.id)} strategy={rectSortingStrategy}>
            {project.promptSets.map((promptSet) => (
              <PromptSetItem
                key={promptSet.id}
                promptSetId={promptSet.id}
                projectId={project.id}
                name={promptSet.name}
                promptsCount={promptSet.prompts.length}
                variablesCount={promptSet.variables.length}
                isEditMode={isEditMode}
                onDeleteClick={onDeletePromptSet}
                onExportPromptSet={onExportPromptSet}
                onRenamePromptSet={onRenamePromptSet}
                onOptionsClick={handlePromptSetOptions}
              />
            ))}
          </SortableContext>

          {!isEditMode && (
            <button
              type="button"
              onClick={onAddPromptSet}
              className="app-focus group flex flex-col items-start gap-0.5 rounded-sm border border-dashed border-iron bg-deep-charcoal/40 p-2.5 text-left transition hover:border-electric-blue/50 hover:bg-graphite/60"
            >
              <p className="truncate text-sm text-white group-hover:text-amethyst">+ Nuevo conjunto</p>
              <p className="w-[95%] truncate text-[.75rem] text-silver">Crear un nuevo set de prompts.</p>
              <p className="min-h-4.5 truncate text-[.75rem] text-ash">Local</p>
            </button>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="app-card p-4 opacity-95">
              <div className="flex items-center gap-2.5">
                <FileTextIcon className="h-4 w-4 text-electric-blue" />
                <h3 className="truncate text-sm font-medium text-white">
                  {project.promptSets.find((s) => s.id === activeId)?.name}
                </h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}
