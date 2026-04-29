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
import { PromptSetItem } from "./prompt-set-item"

interface PromptSetGridProps {
  project: Project
  isEditMode: boolean
  onAddPromptSet: () => void
  onDeletePromptSet: (id: string) => void
  onExportPromptSet: (id: string) => void
  onReorderPromptSets: (oldIndex: number, newIndex: number) => void
  onImportClick: () => void
}

export function PromptSetGrid({
  project,
  isEditMode,
  onAddPromptSet,
  onDeletePromptSet,
  onExportPromptSet,
  onReorderPromptSets,
  onImportClick,
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
                    onClick={onImportClick}
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
                    onClick={onAddPromptSet}
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
                onOptionsClick={handlePromptSetOptions}
              />
            ))}
          </SortableContext>

          {!isEditMode && (
            <button
              onClick={onAddPromptSet}
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
                    {project.promptSets.find((s) => s.id === activeId)?.name}
                  </h3>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
